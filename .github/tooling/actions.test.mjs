import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile, access } from 'node:fs/promises';
import path from 'node:path';
import YAML from 'yaml';

const manifests = ['action.yml', 'with-github-artifacts/action.yml', 'with-ghes-artifacts/action.yml', 'without-artifacts/action.yml', 'setup/action.yml'];
const root = new URL('../../', import.meta.url);

async function readAction(filename) {
  const source = await readFile(new URL(filename, root), 'utf8');
  const document = YAML.parseDocument(source, { uniqueKeys: true });
  assert.deepEqual(document.errors, [], filename);
  assert.doesNotMatch(source, /AUTO-GENERATED|x-repository-paths|x-update-policy/);
  const action = document.toJS({ maxAliasCount: 0 });
  assert.equal(typeof action.name, 'string');
  assert.equal(typeof action.description, 'string');
  YAML.visit(document, { Map(_key, node) {
    const uses = node.get('uses', true);
    if (!uses) return;
    assert.match(uses.value, /^[\w-]+\/[\w.-]+(?:\/[\w.-]+)*@[a-f0-9]{40}$/);
    assert.doesNotMatch(uses.value, /^fortify\/github-action(?:\/|@)/);
    assert.match(uses.comment?.trim() ?? '', /^v\d+\.\d+\.\d+$/);
  } });
  return action;
}

test('manually maintained manifests preserve setup and scan contracts', async () => {
  for (const filename of manifests) {
    const action = await readAction(filename);
    if (filename === 'setup/action.yml') {
      assert.deepEqual(action.runs, { using: 'node24', main: '../runtime/setup.cjs' });
      await access(new URL(path.posix.join(path.posix.dirname(filename), action.runs.main), root));
      assert.equal(action.inputs['export-path'].default, 'true');
      assert.deepEqual(Object.keys(action.inputs).sort(), [
        'debricked-cli', 'export-path', 'fcli', 'fod-uploader', 'sc-client', 'tool-definitions', 'vuln-exporter', 'bugtracker-utility',
      ].sort());
      continue;
    }
    assert.equal(action.runs.using, 'composite');
    const [scan, upload] = action.runs.steps;
    assert.equal(action.runs.steps.length, filename === 'without-artifacts/action.yml' ? 1 : 2);
    assert.equal(scan.id, 'scan');
    assert.match(scan.uses, /^actions\/github-script@/);
    assert.equal(scan.env.FORTIFY_DEBUG, '${{ inputs.debug }}');
    assert.equal(scan.env.GITHUB_TOKEN, '${{ github.token }}');
    const bundle = path.posix.normalize(scan.env.FORTIFY_CI_BUNDLE.replace('${{ github.action_path }}', path.posix.dirname(filename)));
    assert.equal(bundle, 'runtime/run-fcli-ci-action.cjs');
    await access(new URL(bundle, root));
    assert.equal(scan.with.script.trim(), 'const { runScan } = require(process.env.FORTIFY_CI_BUNDLE);\nawait runScan(process.env.FORTIFY_DEBUG);');
    assert.equal(action.inputs.debug.default, 'false');
    if (!upload) {
      assert.deepEqual(Object.keys(action.outputs).sort(), ['debug-artifacts-dir', 'upload-debug-artifacts']);
      for (const name of Object.keys(action.outputs)) {
        assert.equal(action.outputs[name].value, `\${{ steps.scan.outputs.${name} }}`);
      }
    } else {
      assert.equal(action.outputs, undefined);
      assert.match(upload.uses, /^actions\/upload-artifact@/);
      assert.equal(upload.if, "${{ always() && steps.scan.outputs.upload-debug-artifacts == 'true' }}");
      assert.deepEqual(upload.with, {
        name: '${{ inputs.debug-artifact-name }}-${{ github.job }}',
        path: '${{ steps.scan.outputs.debug-artifacts-dir }}',
        'retention-days': '${{ inputs.debug-retention-days }}',
      });
      assert.equal(action.inputs['debug-artifact-name'].default, 'fortify-debug-artifacts');
      assert.equal(action.inputs['debug-retention-days'].default, '1');
    }
  }
});

test('root and GitHub variant remain equivalent; all variants share scan implementation', async () => {
  const base = await readAction('action.yml');
  const github = await readAction('with-github-artifacts/action.yml');
  github.runs.steps[0].env.FORTIFY_CI_BUNDLE = base.runs.steps[0].env.FORTIFY_CI_BUNDLE;
  assert.deepEqual(github, base);
  for (const filename of ['with-ghes-artifacts/action.yml', 'without-artifacts/action.yml']) {
    const action = await readAction(filename);
    action.runs.steps[0].env.FORTIFY_CI_BUNDLE = base.runs.steps[0].env.FORTIFY_CI_BUNDLE;
    assert.deepEqual(action.runs.steps[0], base.runs.steps[0]);
    assert.deepEqual(action.inputs.debug, base.inputs.debug);
  }
});

test('Renovate updates only action.yml manifests with cooldown and compatibility limits', async () => {
  const config = JSON.parse(await readFile(new URL('.github/renovate.json', root), 'utf8'));
  assert.deepEqual(config.enabledManagers, ['github-actions']);
  assert.deepEqual(config.includePaths, ['action.yml', '**/action.yml']);
  assert.deepEqual(config.ignorePaths, ['.github/workflows/**']);
  assert.equal(config.automerge, false);
  const patterns = config['github-actions'].managerFilePatterns.map(pattern => new RegExp(pattern.slice(1, -1)));
  for (const filename of [...manifests, '.github/workflows/publish.yml', 'nested/action.yaml']) {
    assert.equal(patterns.some(pattern => pattern.test(filename)), manifests.includes(filename), filename);
  }
  const [common, ghes, script, digest] = config.packageRules;
  assert.equal(common.minimumReleaseAge, '7 days');
  assert.equal(common.minimumReleaseAgeBehaviour, 'timestamp-required');
  assert.equal(common.internalChecksFilter, 'strict');
  assert.equal(common.pinDigests, true);
  assert.deepEqual(ghes.matchPackageNames, ['actions/upload-artifact']);
  assert.deepEqual(ghes.matchFileNames, ['with-ghes-artifacts/action.yml']);
  assert.equal(ghes.allowedVersions, '>=3.0.0 <4.0.0');
  assert.deepEqual(script.matchPackageNames, ['actions/github-script']);
  assert.equal(script.allowedVersions, '>=9.0.0 <10.0.0');
  assert.deepEqual(digest.matchUpdateTypes, ['digest']);
  assert.equal(digest.enabled, false);
  const ghesSource = await readFile(new URL('with-ghes-artifacts/action.yml', root), 'utf8');
  assert.match(ghesSource, /actions\/upload-artifact@[a-f0-9]{40} # v3\.\d+\.\d+/);
  for (const filename of manifests.slice(0, -1)) {
    assert.match(await readFile(new URL(filename, root), 'utf8'), /actions\/github-script@[a-f0-9]{40} # v9\.\d+\.\d+/);
  }
});

test('Renovate workflow is default-branch-only and does not run on pull requests', async () => {
  const workflow = YAML.parse(await readFile(new URL('.github/workflows/update-action-pins.yml', root), 'utf8'));
  assert.deepEqual(Object.keys(workflow.on).sort(), ['schedule', 'workflow_dispatch']);
  assert.equal(workflow.jobs.renovate.if, 'github.ref_name == github.event.repository.default_branch');
  assert.deepEqual(workflow.jobs.renovate.permissions, { contents: 'write', 'pull-requests': 'write' });
  const run = workflow.jobs.renovate.steps.find(step => step.run);
  assert.match(run.run, /^npx --yes --package=renovate@\d+\.\d+\.\d+ renovate$/);
  assert.equal(run.env.RENOVATE_TOKEN, '${{ github.token }}');
  assert.equal(run.env.RENOVATE_REPOSITORIES, '${{ github.repository }}');
  assert.equal(run.env.RENOVATE_ALLOWED_COMMANDS, '[]');
  assert.equal(run.env.RENOVATE_ONBOARDING, 'false');
  assert.equal(run.env.RENOVATE_REQUIRE_CONFIG, 'required');
});
