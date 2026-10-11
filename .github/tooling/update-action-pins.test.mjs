import assert from 'node:assert/strict';
import test from 'node:test';
import { mkdtemp, mkdir, writeFile, readFile, rm, symlink } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { parseReleaseTag, selectRelease, validateManifest, discoverReferences, planConfiguration,
  updatePins, GitHubClient, exportUpdatePatch, applyUpdatePatch } from './update-action-pins.mjs';
import { generateRepository, sourceFile, parseSource } from './generate-actions.mjs';

const now = Date.parse('2026-10-08T12:00:00Z');
const release = (tag, days, extra = {}) => ({ tag_name: tag,
  published_at: new Date(now - days * 86400000).toISOString(), draft: false, prerelease: false, ...extra });
const oldSha = '1'.repeat(40);
const newSha = '2'.repeat(40);
const actionSource = (tag = 'v7.0.0', policy = '', action = 'actions/upload-artifact') => `updates:
  minimumReleaseAgeDays: 7
${policy ? '  policies:\n    ghes:\n      allowedMajors: [3]\n' : ''}parts:
  inputs: &inputs
    path: \${{ github.workspace }}
  upload: &upload
    name: Upload
${policy ? '    x-update-policy: ghes\n' : ''}    uses: ${action}@${oldSha} # ${tag}
    with: *inputs
outputs:
  action.yml: &action
    name: Test
    runs:
      using: composite
      steps:
        - *upload
  with-github-artifacts/action.yml: *action
`;

test('age filtering selects eligible previous releases and supports configured minimum age', () => {
  assert.equal(selectRelease([release('v8.0.0', 2), release('v7.0.1', 7)], {}, now).tag_name, 'v7.0.1');
  assert.equal(selectRelease([release('v7.0.1', 2)], {}, now, 1).tag_name, 'v7.0.1');
  assert.equal(selectRelease([release('v7.0.1', 2)], {}, now, 3), undefined);
});

test('GitHub may follow new majors while GHES remains on v3', () => {
  const releases = [release('v8.0.0', 8), release('v7.1.0', 10), release('v3.2.2', 20)];
  assert.equal(selectRelease(releases, {}, now).tag_name, 'v8.0.0');
  assert.equal(selectRelease(releases, { allowedMajors: [3] }, now).tag_name, 'v3.2.2');
});

test('exclude missing timestamps, drafts, prereleases and moving major tags', () => {
  assert.equal(selectRelease([release('v8.0.0', 8, { published_at: null }),
    release('v8.0.1', 8, { draft: true }), release('v8.0.2', 8, { prerelease: true }),
    release('v8', 8), release('v8.0.3-beta.1', 8)], {}, now), undefined);
});

test('runtime variants require explicit opt-in', () => {
  const releases = [release('v3.2.2', 8), release('v3.2.2-node20', 8)];
  assert.equal(selectRelease(releases, {}, now).tag_name, 'v3.2.2');
  assert.equal(selectRelease(releases, { tagVariant: '-node20' }, now).tag_name, 'v3.2.2-node20');
  assert.equal(parseReleaseTag('v3.2.2-node20').version, '3.2.2');
});

test('repository source discovers github-script once, unrestricted GitHub upload and GHES policy', async () => {
  const source = await readFile(new URL('../action-src/actions.yml', import.meta.url), 'utf8');
  const { manifest, references } = discoverReferences(source);
  assert.equal(manifest.minimumReleaseAgeDays, 7);
  assert.deepEqual(manifest.policies['ghes-upload'].allowedMajors, [3]);
  assert.equal(references.length, 3);
  assert.equal(references.filter(ref => ref.action === 'actions/github-script').length, 1);
  assert.deepEqual(references.find(ref => ref.action === 'actions/upload-artifact' && !ref.policy.allowedMajors).policy, {});
});

test('anchored definitions discovered once; internal, unpinned and uncommented references rejected', () => {
  assert.equal(discoverReferences(actionSource()).references.length, 1);
  assert.throws(() => discoverReferences(actionSource().replace(oldSha, 'v7')), /full SHA/);
  assert.throws(() => discoverReferences(actionSource().replace(' # v7.0.0', '')), /release comment/);
  assert.throws(() => discoverReferences(actionSource().replace('actions/upload-artifact', 'fortify/github-action/setup')), /internal actions/);
  assert.throws(() => discoverReferences(actionSource().replace('*upload', '*missing')));
});

test('reject invalid, unknown, unused and violated policies', () => {
  assert.throws(() => validateManifest({ minimumReleaseAgeDays: -1 }));
  assert.throws(() => validateManifest({ minimumReleaseAgeDays: 7, policies: { '../escape': {} } }));
  assert.throws(() => validateManifest({ minimumReleaseAgeDays: 7, unknown: true }));
  for (const policy of [{ allowedMajors: [] }, { allowedMajors: ['3'] }, { tagVariant: '-beta' }, { typo: true }, null]) {
    assert.throws(() => validateManifest({ minimumReleaseAgeDays: 7, policies: { ghes: policy } }));
  }
  assert.throws(() => discoverReferences(actionSource('v3.2.0', 'ghes').replace('x-update-policy: ghes', 'x-update-policy: typo')), /Unknown update policy/);
  assert.throws(() => discoverReferences(actionSource('v3.2.0', 'ghes').replace('    x-update-policy: ghes\n', '')), /Unused update policy/);
  assert.throws(() => discoverReferences(actionSource('v7.0.0', 'ghes')), /violates policy/);
});

test('changed defaults pinned; removed inputs, new required inputs and runtimes require review', () => {
  const current = { inputs: { path: { required: true }, archive: { default: 'true' } }, runs: { using: 'node20' } };
  const candidate = { inputs: { archive: { default: 'false' }, token: { required: true } }, runs: { using: 'node24' } };
  const config = planConfiguration(discoverReferences(actionSource()).references[0].values, current, candidate);
  assert.deepEqual(config.additions, { archive: 'true' });
  assert.equal(config.warnings.length, 3);
});

async function fixture(context, source = actionSource()) {
  const root = await mkdtemp(path.join(os.tmpdir(), 'action-pins-'));
  context.after(() => rm(root, { recursive: true, force: true }));
  await mkdir(path.join(root, '.github/action-src'), { recursive: true });
  await mkdir(path.join(root, 'with-github-artifacts'));
  await writeFile(path.join(root, sourceFile), source);
  await generateRepository(root);
  return root;
}

function mockClient(releases = [release('v7.0.1', 8)]) {
  return { releases: async () => releases,
    resolveTag: async (_repo, tag) => ['v7.0.0', 'v3.2.0'].includes(tag) ? oldSha : newSha,
    metadata: async () => ({ inputs: { path: { required: true } }, runs: { using: 'node24' } }) };
}

test('dry run read-only; write updates source and consumers; repeated run idempotent', async context => {
  const root = await fixture(context);
  const client = mockClient();
  const report = await updatePins(root, client, { now });
  assert.equal(report.updates.length, 1);
  assert.equal(report.requiresMigration, false);
  assert.equal(await readFile(path.join(root, sourceFile), 'utf8'), actionSource());
  await updatePins(root, client, { now, write: true });
  const updated = await readFile(path.join(root, sourceFile), 'utf8');
  assert.match(updated, /&upload/);
  assert.match(updated, /\*upload/);
  assert.match(updated, new RegExp(newSha));
  await generateRepository(root, { check: true });
  for (const filename of ['action.yml', 'with-github-artifacts/action.yml']) assert.match(await readFile(path.join(root, filename), 'utf8'), new RegExp(newSha));
  assert.equal((await updatePins(root, client, { now, write: true })).updates.length, 0);
});

test('upload and github-script major changes trigger draft review; GHES minor changes do not', async context => {
  const releases = [release('v8.0.0', 8), release('v3.2.2', 8)];
  for (const action of ['actions/upload-artifact', 'actions/github-script']) {
    const root = await fixture(context, actionSource('v7.0.0', '', action));
    const report = await updatePins(root, mockClient(releases), { now, write: true });
    assert.equal(report.updates[0].to, 'v8.0.0');
    assert.equal(report.requiresMigration, true);
  }
  const root = await fixture(context, actionSource('v3.2.0', 'ghes'));
  const report = await updatePins(root, mockClient(releases), { now, write: true });
  assert.equal(report.updates[0].to, 'v3.2.2');
  assert.equal(report.requiresMigration, false);
});

test('input-default migrations preserve anchored steps and resolve aliased inputs', async context => {
  const root = await fixture(context);
  const client = { ...mockClient([release('v8.0.0', 8)]), metadata: async (_action, sha) => ({
    inputs: { path: { required: true }, archive: { default: sha === oldSha ? 'true' : 'false' } }, runs: { using: 'node24' },
  }) };
  await updatePins(root, client, { now, write: true });
  const source = await readFile(path.join(root, sourceFile), 'utf8');
  assert.match(source, /&upload/);
  assert.match(source, /\*upload/);
  const { value } = parseSource(source);
  assert.equal(value.parts.upload.with.archive, 'true');
  assert.equal(value.parts.upload.with.path, '${{ github.workspace }}');
  await generateRepository(root, { check: true });
});

test('no downgrade or young-release PR; moved tags and stale output fail without source writes', async context => {
  const root = await fixture(context);
  for (const releases of [[release('v6.0.0', 8)], [release('v7.0.1', 2)]]) assert.equal((await updatePins(root, mockClient(releases), { now })).updates.length, 0);
  await assert.rejects(updatePins(root, { ...mockClient(), resolveTag: async () => newSha }, { now, write: true }), /moved/);
  assert.equal(await readFile(path.join(root, sourceFile), 'utf8'), actionSource());
  await writeFile(path.join(root, 'action.yml'), 'manual edit');
  await assert.rejects(updatePins(root, mockClient(), { now, write: true }), /stale/);
  assert.equal(await readFile(path.join(root, sourceFile), 'utf8'), actionSource());
});

test('explicit runtime variant switch requires review without allowing downgrades', async context => {
  const source = actionSource('v3.2.0', 'ghes').replace('allowedMajors: [3]', "allowedMajors: [3]\n      tagVariant: '-node20'");
  const root = await fixture(context, source);
  const report = await updatePins(root, mockClient([release('v3.2.0-node20', 8)]), { now });
  assert.equal(report.updates[0].to, 'v3.2.0-node20');
  assert.equal(report.requiresMigration, true);
  assert.equal((await updatePins(root, mockClient([release('v3.1.0-node20', 8)]), { now })).updates.length, 0);
});

test('symlinked source or outputs rejected without modifying external files', async context => {
  const root = await fixture(context);
  const outside = path.join(root, 'outside.yml');
  await writeFile(outside, 'untouched');
  await rm(path.join(root, 'action.yml'));
  await symlink(outside, path.join(root, 'action.yml'));
  await assert.rejects(updatePins(root, mockClient(), { now, write: true }), /symlink/);
  assert.equal(await readFile(outside, 'utf8'), 'untouched');
});

test('GitHub client paginates releases and dereferences annotated tags', async () => {
  const client = new GitHubClient();
  const endpoints = [];
  client.get = async endpoint => {
    endpoints.push(endpoint);
    const page = new URL(endpoint, 'https://api.github.com').searchParams.get('page');
    if (page === '1') return Array.from({ length: 100 }, () => release('v7.0.1', 2));
    if (page === '2') return [release('v7.0.0', 8)];
    if (endpoint.includes('/git/ref/')) return { object: { type: 'tag', sha: oldSha } };
    if (endpoint.includes('/git/tags/')) return { object: { type: 'commit', sha: newSha } };
    throw new Error(`Unexpected endpoint: ${endpoint}`);
  };
  assert.equal((await client.releases('actions/upload-artifact')).length, 101);
  assert.equal(await client.resolveTag('actions/upload-artifact', 'v7.0.1'), newSha);
  assert.equal(endpoints.length, 4);
});

function git(root, ...args) {
  return execFileSync('git', args, { cwd: root, encoding: 'utf8' });
}

async function patchFixture(context) {
  const root = await fixture(context, actionSource().replace('with-github-artifacts/action.yml', 'new-variant/nested/action.yaml'));
  git(root, 'init', '--quiet');
  git(root, 'config', 'user.name', 'Patch Test');
  git(root, 'config', 'user.email', 'patch@example.invalid');
  git(root, 'add', '.');
  git(root, 'commit', '--quiet', '-m', 'fixture');
  return root;
}

test('patch export and scope validation follow declared output paths with Windows Git CRLF conversion', async context => {
  const producer = await patchFixture(context);
  await updatePins(producer, mockClient(), { now, write: true });
  const patch = path.join(producer, 'update.patch');
  await exportUpdatePatch(producer, patch);
  assert.match(await readFile(patch, 'utf8'), /new-variant\/nested\/action.yaml/);
  const consumer = await patchFixture(context);
  git(consumer, 'config', 'core.autocrlf', 'true');
  await applyUpdatePatch(consumer, patch);
  assert.match(await readFile(path.join(consumer, 'action.yml'), 'utf8'), /\r\n/);
  await generateRepository(consumer, { check: true });
  assert.match(git(consumer, 'diff', '--cached', '--name-only'), /new-variant\/nested\/action.yaml/);
});

test('patch consumer rejects added files even if ordinary worktree diff would omit them', async context => {
  const producer = await patchFixture(context);
  await mkdir(path.join(producer, '.github/tooling'), { recursive: true });
  await writeFile(path.join(producer, '.github/tooling/injected.test.mjs'), 'throw new Error("must not execute");\n');
  git(producer, 'add', '.github/tooling/injected.test.mjs');
  const patch = path.join(producer, 'injection.patch');
  await writeFile(patch, git(producer, 'diff', '--cached', '--binary'));
  const consumer = await patchFixture(context);
  await assert.rejects(applyUpdatePatch(consumer, patch), /only modify trusted source/);
});