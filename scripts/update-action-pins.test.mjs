import assert from 'node:assert/strict';
import test from 'node:test';
import { mkdtemp, mkdir, writeFile, readFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { parseReleaseTag, selectRelease, validateManifest, discoverReferences, planConfiguration,
  replaceReference, updatePins, GitHubClient } from './update-action-pins.mjs';

const now = Date.parse('2026-10-08T12:00:00Z');
const release = (tag, days, extra = {}) => ({
  tag_name: tag,
  published_at: new Date(now - days * 86400000).toISOString(),
  draft: false,
  prerelease: false,
  ...extra,
});

test('newer young release does not block older eligible release', () => {
  assert.equal(selectRelease([release('v7.0.2', 2), release('v7.0.1', 7)], {}, now).tag_name, 'v7.0.1');
});

test('default follows newest eligible major, while GHES remains on approved major', () => {
  const releases = [release('v8.0.0', 8), release('v7.1.0', 10), release('v3.2.2', 20)];
  assert.equal(selectRelease(releases, {}, now).tag_name, 'v8.0.0');
  assert.equal(selectRelease(releases, { allowedMajors: [3] }, now).tag_name, 'v3.2.2');
});

test('future major does not block eligible previous major', () => {
  assert.equal(selectRelease([release('v8.0.0', 2), release('v7.0.1', 8)], {}, now).tag_name, 'v7.0.1');
});

test('exclude missing timestamps, drafts, prereleases and moving major tags', () => {
  assert.equal(selectRelease([
    release('v8.0.0', 8, { published_at: null }),
    release('v8.0.1', 8, { draft: true }),
    release('v8.0.2', 8, { prerelease: true }),
    release('v8', 8),
    release('v8.0.3-beta.1', 8),
  ], {}, now), undefined);
});

test('runtime variants require explicit opt-in', () => {
  const releases = [release('v3.2.2', 8), release('v3.2.2-node20', 8)];
  assert.equal(selectRelease(releases, {}, now).tag_name, 'v3.2.2');
  assert.equal(selectRelease(releases, { tagVariant: '-node20' }, now).tag_name, 'v3.2.2-node20');
  assert.equal(parseReleaseTag('v3.2.2-node20').version, '3.2.2');
});

test('release age is configurable', () => {
  assert.equal(selectRelease([release('v7.0.1', 2)], {}, now, 1).tag_name, 'v7.0.1');
  assert.equal(selectRelease([release('v7.0.1', 2)], {}, now, 3), undefined);
});

test('repository policy retains seven-day third-party updates and GHES major constraint', async () => {
  const manifest = JSON.parse(await readFile(new URL('../action-updates.json', import.meta.url), 'utf8'));
  assert.equal(manifest.minimumReleaseAgeDays, 7);
  assert.equal(manifest.trackedRepositories, undefined);
  assert.deepEqual(manifest.overrides['with-ghes-artifacts']['actions/upload-artifact'].allowedMajors, [3]);
});

const oldSha = '1'.repeat(40);
const newSha = '2'.repeat(40);
const actionSource = (tag = 'v7.0.0', sha = oldSha) => `name: Test
runs:
  using: composite
  steps:
    - name: Upload
      uses: actions/upload-artifact@${sha} # ${tag}
      with:
        path: \${{ github.workspace }}
    - uses: fortify/github-action/setup@main
`;

test('discovery excludes internal actions and requires exact SHA and release comment', () => {
  assert.equal(discoverReferences(actionSource(), 'action.yml').length, 1);
  assert.throws(() => discoverReferences(actionSource().replace(oldSha, 'v7'), 'action.yml'), /full SHA/);
  assert.throws(() => discoverReferences(actionSource().replace(' # v7.0.0', ''), 'action.yml'), /release comment/);
  assert.throws(() => discoverReferences('runs:\n  steps: [*missing]', 'action.yml'));
});

test('sparse policies reject invalid paths, variants, majors and unknown settings', () => {
  const manifest = { minimumReleaseAgeDays: 7, overrides: { 'with-ghes-artifacts': {
    'actions/upload-artifact': { allowedMajors: [3] },
  } } };
  assert.equal(validateManifest(manifest), manifest);
  assert.throws(() => validateManifest({ minimumReleaseAgeDays: -1 }));
  assert.throws(() => validateManifest({ minimumReleaseAgeDays: 7, overrides: { '../escape': {} } }));
  assert.throws(() => validateManifest({ ...manifest, unknown: true }));
  for (const policy of [{ allowedMajors: [] }, { allowedMajors: ['3'] }, { tagVariant: '-beta' }, { typo: true }]) {
    assert.throws(() => validateManifest({ minimumReleaseAgeDays: 7, overrides: { '.': { 'actions/upload-artifact': policy } } }));
  }
});

test('pin replacement preserves unrelated text and internal references', () => {
  const source = actionSource();
  const reference = discoverReferences(source, 'action.yml')[0];
  const edit = replaceReference(source, reference, newSha, 'v7.0.1');
  const updated = source.slice(0, edit.start) + edit.text + source.slice(edit.end);
  assert.equal(updated, source.replace(`${oldSha} # v7.0.0`, `${newSha} # v7.0.1`));
});

test('changed upstream defaults are pinned explicitly and missing inputs require review', () => {
  const source = actionSource();
  const reference = discoverReferences(source, 'action.yml')[0];
  const current = { inputs: { path: { required: true }, archive: { default: 'true' } }, runs: { using: 'node20' } };
  const candidate = { inputs: { archive: { default: 'false' }, token: { required: true } }, runs: { using: 'node24' } };
  const config = planConfiguration(reference.step, current, candidate);
  assert.deepEqual(config.additions, { archive: 'true' });
  assert.equal(config.warnings.length, 3);
  const edit = replaceReference(source, reference, newSha, 'v8.0.0', config.additions);
  const updated = source.slice(0, edit.start) + edit.text + source.slice(edit.end);
  const references = discoverReferences(updated, 'action.yml');
  assert.equal(references[0].step.get('with').get('archive'), 'true');
  assert.equal(references[0].step.get('with').get('path'), '${{ github.workspace }}');
  assert.match(updated, /fortify\/github-action\/setup@main/);
});

async function fixture(context, source = actionSource()) {
  const root = await mkdtemp(path.join(os.tmpdir(), 'action-pins-'));
  context.after(() => rm(root, { recursive: true, force: true }));
  await writeFile(path.join(root, 'action.yml'), source);
  return root;
}

function mockClient(releases = [release('v7.0.1', 8)]) {
  return {
    releases: async () => releases,
    resolveTag: async (_repository, tag) => tag === 'v7.0.0' || tag === 'v3.2.0' ? oldSha : newSha,
    metadata: async () => ({ inputs: { path: { required: true } }, runs: { using: 'node24' } }),
  };
}

test('dry run is read-only, write updates pins, and repeated run is idempotent', async context => {
  const root = await fixture(context);
  const manifest = { minimumReleaseAgeDays: 7 };
  const client = mockClient();
  const report = await updatePins(root, manifest, client, { now });
  assert.equal(report.updates.length, 1);
  assert.equal(report.requiresMigration, false);
  assert.equal(await readFile(path.join(root, 'action.yml'), 'utf8'), actionSource());
  await updatePins(root, manifest, client, { now, write: true });
  assert.match(await readFile(path.join(root, 'action.yml'), 'utf8'), new RegExp(newSha));
  assert.equal((await updatePins(root, manifest, client, { now, write: true })).updates.length, 0);
});

test('directory override affects only GHES; major changes require draft review', async context => {
  const root = await fixture(context);
  await mkdir(path.join(root, 'with-ghes-artifacts'));
  await writeFile(path.join(root, 'with-ghes-artifacts/action.yml'), actionSource('v3.2.0'));
  const manifest = { minimumReleaseAgeDays: 7, overrides: { 'with-ghes-artifacts': {
    'actions/upload-artifact': { allowedMajors: [3] },
  } } };
  const report = await updatePins(root, manifest, mockClient([release('v8.0.0', 8), release('v3.2.2', 8)]), { now });
  assert.deepEqual(report.updates.map(update => update.to), ['v8.0.0', 'v3.2.2']);
  assert.equal(report.requiresMigration, true);
});

test('no downgrade, no young-release PR, and no silently unused policy', async context => {
  const root = await fixture(context);
  for (const releases of [[release('v6.0.0', 8)], [release('v7.0.1', 2)]]) {
    assert.equal((await updatePins(root, { minimumReleaseAgeDays: 7 }, mockClient(releases), { now })).updates.length, 0);
  }
  await assert.rejects(updatePins(root, { minimumReleaseAgeDays: 7, overrides: { typo: {
    'actions/upload-artifact': { allowedMajors: [3] },
  } } }, mockClient(), { now, write: true }), /Unused override/);
  assert.equal(await readFile(path.join(root, 'action.yml'), 'utf8'), actionSource());
});

test('moved release tags fail closed without modifying files', async context => {
  const root = await fixture(context);
  const client = { ...mockClient(), resolveTag: async () => newSha };
  await assert.rejects(updatePins(root, { minimumReleaseAgeDays: 7 }, client, { now, write: true }), /moved/);
  assert.equal(await readFile(path.join(root, 'action.yml'), 'utf8'), actionSource());
});

test('explicit runtime variant switch updates same-version pin without allowing downgrades', async context => {
  const root = await fixture(context, actionSource('v3.2.0'));
  const manifest = { minimumReleaseAgeDays: 7, overrides: { '.': {
    'actions/upload-artifact': { allowedMajors: [3], tagVariant: '-node20' },
  } } };
  const report = await updatePins(root, manifest, mockClient([release('v3.2.0-node20', 8)]), { now });
  assert.equal(report.updates[0].to, 'v3.2.0-node20');
  assert.equal(report.requiresMigration, true);
  assert.equal((await updatePins(root, manifest, mockClient([release('v3.1.0-node20', 8)]), { now })).updates.length, 0);
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