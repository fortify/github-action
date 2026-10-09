import assert from 'node:assert/strict';
import test from 'node:test';
import YAML from 'yaml';
import { generateActions, parseSource, generateRepository, validateOutputPath } from './generate-actions.mjs';
import { readFile, mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

const source = `parts:
  scan: &scan
    - id: scan
      run: echo scan
      shell: bash
  upload: &upload
    uses: actions/upload-artifact@${'1'.repeat(40)}
    x-update-policy: ghes
outputs:
  without-artifacts/action.yml: &base
    name: Scan
    runs:
      using: composite
      steps: *scan
  action.yml:
    <<: *base
    name: Upload
    runs:
      using: composite
      steps:
        - *scan
        - *upload
`;

test('aliases, shallow merges and step groups produce deterministic flat actions', () => {
  const generated = generateActions(source);
  const action = YAML.parse(generated.get('action.yml'));
  assert.equal(action.name, 'Upload');
  assert.equal(action.runs.steps.length, 2);
  assert.equal(action.runs.steps[0].id, 'scan');
  assert.equal(action.runs.steps[1]['x-update-policy'], undefined);
  assert.deepEqual(generateActions(source), generated);
  assert.doesNotMatch(generated.get('action.yml'), /&base|\*scan|<<:/);
});

test('reject unsafe paths, duplicate keys, cycles and unknown aliases', () => {
  assert.throws(() => generateActions(source.replace('action.yml:', '../escape.yml:')), /output path/);
  assert.throws(() => parseSource('parts: {}\nparts: {}'), /unique/);
  assert.throws(() => generateActions(source.replace('*scan', '*missing')));
  assert.throws(() => generateActions('outputs: &cycle\n  action.yml: *cycle'));
});

test('reject internal and unpinned references, nested groups and broken step references', () => {
  assert.throws(() => generateActions(source.replace(`actions/upload-artifact@${'1'.repeat(40)}`, 'fortify/github-action/setup@main')), /internal actions/);
  assert.throws(() => generateActions(source.replace('1'.repeat(40), 'v3')), /full SHA/);
  assert.throws(() => generateActions(source.replace('run: echo scan', 'run: echo ${{ steps.missing.outputs.value }}')), /unknown step/);
  assert.throws(() => generateActions(source.replace('      steps: *scan', '      steps: [[*scan]]')), /step group/);
  assert.throws(() => generateActions(source.replace('        - *upload', '        - *scan')), /duplicate/);
});

test('repository actions have one scan step, optional upload, existing public outputs and same-commit runtime', async () => {
  const source = await readFile(new URL('../action-src/actions.yml', import.meta.url), 'utf8');
  const generated = generateActions(source);
  for (const [filename, content] of generated) {
    assert.match(content, /^# AUTO-GENERATED FILE - DO NOT EDIT MANUALLY\.\n# Source: \.github\/action-src\/actions\.yml\n# Regenerate: npm run generate --prefix \.github\/tooling\n/);
    const action = YAML.parse(content);
    assert.equal(action.runs.steps.length, filename === 'without-artifacts/action.yml' ? 1 : 2);
    assert.equal(action.runs.steps[0].id, 'scan');
    assert.match(content, /github-script@[a-f0-9]{40} # v\d+\.\d+\.\d+/);
    const bundle = action.runs.steps[0].env.FORTIFY_SETUP_BUNDLE.replace('${{ github.action_path }}', path.posix.dirname(filename));
    assert.equal(path.posix.normalize(bundle), 'runtime/setup.cjs');
    assert.equal(action.runs.steps[0].env.FORTIFY_DEBUG, '${{ inputs.debug }}');
    if (filename === 'without-artifacts/action.yml') {
      assert.equal(action.outputs['upload-debug-artifacts'].value, '${{ steps.scan.outputs.upload-debug-artifacts }}');
    } else {
      assert.equal(action.outputs, undefined);
      assert.match(action.runs.steps[1].if, /always\(\)/);
      assert.match(action.runs.steps[1].if, /steps\.scan\.outputs/);
    }
  }
  const root = YAML.parse(generated.get('action.yml'));
  const variant = YAML.parse(generated.get('with-github-artifacts/action.yml'));
  root.runs.steps[0].env.FORTIFY_SETUP_BUNDLE = variant.runs.steps[0].env.FORTIFY_SETUP_BUNDLE;
  assert.deepEqual(root, variant);
  assert.match(source, /without-artifacts\/action\.yml: &without-artifacts/);
  assert.match(source, /with-github-artifacts\/action\.yml: &with-github-artifacts/);
  assert.match(source, /action\.yml: \*with-github-artifacts/);
});

test('output declarations support arbitrary safe action paths, including action.yaml', () => {
  assert.equal(validateOutputPath('new-variant/nested/action.yaml'), 'new-variant/nested/action.yaml');
  const generated = generateActions(source.replace('  action.yml:', '  new-variant/nested/action.yaml:'));
  assert.equal(generated.has('new-variant/nested/action.yaml'), true);
  for (const filename of ['../action.yml', '/action.yml', '.github/workflows/action.yml', 'variant/../action.yml', 'variant\\action.yml', 'README.md']) assert.throws(() => validateOutputPath(filename), /output path/);
});

test('repository paths are expanded per output and removed from generated metadata', () => {
  const template = source.replace('    x-update-policy: ghes', '    x-update-policy: ghes\n    x-repository-paths:\n      BUNDLE: runtime/setup.cjs');
  const generated = generateActions(template);
  const action = YAML.parse(generated.get('action.yml'));
  assert.equal(action.runs.steps[1].env.BUNDLE, '${{ github.action_path }}/runtime/setup.cjs');
  assert.equal(action.runs.steps[1]['x-repository-paths'], undefined);
  assert.throws(() => generateActions(template.replace('runtime/setup.cjs', '../escape')), /repository path/);
});

test('generation creates newly declared outputs; check mode reports missing files without creating them', async context => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'action-generation-'));
  context.after(() => rm(root, { recursive: true, force: true }));
  await mkdir(path.join(root, '.github/action-src'), { recursive: true });
  const template = source.replace('  action.yml:', '  new-variant/nested/action.yaml:');
  await writeFile(path.join(root, '.github/action-src/actions.yml'), template);
  await assert.rejects(generateRepository(root, { check: true }), /stale/);
  await assert.rejects(readFile(path.join(root, 'new-variant/nested/action.yaml')), { code: 'ENOENT' });
  await generateRepository(root);
  await generateRepository(root, { check: true });
});