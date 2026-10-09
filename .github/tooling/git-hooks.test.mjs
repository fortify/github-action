import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtemp, mkdir, readFile, writeFile, rm, readdir, symlink } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { installHooks, pushedCommits, validateSnapshot } from './git-hooks.mjs';
import { generateActions, sourceFile } from './generate-actions.mjs';

function git(root, ...args) {
  return execFileSync('git', args, { cwd: root, encoding: 'utf8' });
}

async function fixture(context) {
  const root = await mkdtemp(path.join(os.tmpdir(), 'fortify-hook-test-'));
  context.after(() => rm(root, { recursive: true, force: true }));
  git(root, 'init', '--quiet');
  git(root, 'config', 'user.name', 'Hook Test');
  git(root, 'config', 'user.email', 'hook@example.invalid');
  const tooling = path.join(root, '.github/tooling');
  await mkdir(path.join(tooling, 'node_modules'), { recursive: true });
  await writeFile(path.join(tooling, 'package.json'), '{}');
  await writeFile(path.join(tooling, 'package-lock.json'), '{"packages":{"":{}}}');
  await writeFile(path.join(tooling, 'node_modules/.package-lock.json'), '{"packages":{}}');
  await writeFile(path.join(tooling, 'generate-actions.mjs'), `import { readFileSync } from 'node:fs';
if (readFileSync('../../source', 'utf8') !== readFileSync('../../output', 'utf8')) process.exitCode = 1;\n`);
  await writeFile(path.join(root, 'source'), 'same');
  await writeFile(path.join(root, 'output'), 'same');
  git(root, 'add', '.github/tooling/package.json', '.github/tooling/package-lock.json', '.github/tooling/generate-actions.mjs', 'source', 'output');
  git(root, 'commit', '--quiet', '-m', 'fixture');
  return root;
}

test('pre-commit validates index, ignores unstaged edits and never changes files or index', async context => {
  const root = await fixture(context);
  await writeFile(path.join(root, 'source'), 'unstaged');
  const before = git(root, 'status', '--porcelain');
  await validateSnapshot(root);
  assert.equal(git(root, 'status', '--porcelain'), before);
  assert.equal(await readFile(path.join(root, 'source'), 'utf8'), 'unstaged');
  git(root, 'add', 'source');
  const index = git(root, 'write-tree');
  await assert.rejects(validateSnapshot(root), /Regenerate explicitly/);
  assert.equal(git(root, 'write-tree'), index);
});

test('pre-push snapshot uses pushed commit rather than index or working tree', async context => {
  const root = await fixture(context);
  const commit = git(root, 'rev-parse', 'HEAD').trim();
  await writeFile(path.join(root, 'source'), 'staged change');
  git(root, 'add', 'source');
  const index = git(root, 'write-tree');
  await validateSnapshot(root, { commit });
  assert.equal(git(root, 'write-tree'), index);
});

test('install is opt-in, idempotent and refuses existing hook configuration or custom hooks', async context => {
  const root = await fixture(context);
  await installHooks(root);
  assert.equal(git(root, 'config', '--get', 'core.hooksPath').trim(), '.github/tooling/hooks');
  await installHooks(root);
  git(root, 'config', 'core.hooksPath', '.custom-hooks');
  await assert.rejects(installHooks(root), /Existing core.hooksPath/);
  assert.equal(git(root, 'config', '--get', 'core.hooksPath').trim(), '.custom-hooks');
  git(root, 'config', '--unset', 'core.hooksPath');
  await writeFile(path.join(root, '.git/hooks/pre-commit'), 'custom hook');
  await assert.rejects(installHooks(root), /Existing hooks/);
  assert.equal(await readFile(path.join(root, '.git/hooks/pre-commit'), 'utf8'), 'custom hook');
});

test('push input handles multiple refs, duplicate tips and deletions; rejects invalid hashes', () => {
  const commit = '1'.repeat(40);
  const zero = '0'.repeat(40);
  assert.deepEqual(pushedCommits(`refs/heads/main ${commit} refs/heads/main ${zero}\nrefs/tags/v1 ${commit} refs/tags/v1 ${zero}\n(delete) ${zero} refs/heads/old ${commit}\n`), [commit]);
  assert.deepEqual(pushedCommits(''), []);
  assert.throws(() => pushedCommits('refs/heads/main --help refs/heads/main anything'), /Invalid/);
});

test('snapshots bypass checkout filters and CRLF conversion', async context => {
  const root = await fixture(context);
  await writeFile(path.join(root, 'source'), 'same\n');
  await writeFile(path.join(root, 'output'), 'same\n');
  await writeFile(path.join(root, '.gitattributes'), 'source filter=break\n');
  git(root, 'add', 'source', 'output', '.gitattributes');
  git(root, 'config', 'core.autocrlf', 'true');
  git(root, 'config', 'filter.break.smudge', 'exit 1');
  git(root, 'config', 'filter.break.required', 'true');
  await validateSnapshot(root);
});

test('symlink snapshots rejected before extraction', async context => {
  const root = await fixture(context);
  const hash = execFileSync('git', ['hash-object', '-w', '--stdin'], { cwd: root, input: '/outside', encoding: 'utf8' }).trim();
  git(root, 'update-index', '--add', '--cacheinfo', '120000', hash, 'link');
  await assert.rejects(validateSnapshot(root), /regular files/);
});

test('installer supports repositories with no hooks directory', async context => {
  const root = await fixture(context);
  await rm(path.join(root, '.git/hooks'), { recursive: true });
  await installHooks(root);
  assert.equal(git(root, 'config', '--get', 'core.hooksPath').trim(), '.github/tooling/hooks');
});

test('pre-push full validation runs bundle check, types and offline tests without changing repository', async context => {
  const root = await fixture(context);
  const tooling = path.join(root, '.github/tooling');
  await writeFile(path.join(tooling, 'build-setup.mjs'), `import assert from 'node:assert/strict'; assert.equal(process.argv[2], '--check');`);
  await mkdir(path.join(tooling, 'node_modules/typescript/bin'), { recursive: true });
  await writeFile(path.join(tooling, 'node_modules/typescript/bin/tsc'), `const assert = require('node:assert/strict'); assert.equal(process.argv[2], '--noEmit');`);
  await writeFile(path.join(tooling, 'fixture.test.mjs'), `import test from 'node:test'; test('snapshot test', () => {});`);
  git(root, 'add', '.github/tooling/build-setup.mjs', '.github/tooling/fixture.test.mjs');
  git(root, 'commit', '--quiet', '-m', 'full validation fixture');
  const before = git(root, 'status', '--porcelain');
  await validateSnapshot(root, { commit: git(root, 'rev-parse', 'HEAD').trim(), full: true });
  assert.equal(git(root, 'status', '--porcelain'), before);
});

test('staged dependency changes require matching installed packages without touching index', async context => {
  const root = await fixture(context);
  const tooling = path.join(root, '.github/tooling');
  await writeFile(path.join(tooling, 'package-lock.json'), JSON.stringify({ packages: {
    '': {}, 'node_modules/example': { version: '2.0.0', integrity: 'sha512-example' },
  } }));
  git(root, 'add', '.github/tooling/package-lock.json');
  const index = git(root, 'write-tree');
  await assert.rejects(validateSnapshot(root), /Installed dependencies do not match/);
  assert.equal(git(root, 'write-tree'), index);
});

test('real action and runtime checks pass from a relocated raw Git snapshot', async context => {
  const root = await fixture(context);
  const original = fileURLToPath(new URL('../../', import.meta.url));
  const outputs = generateActions(await readFile(path.join(original, sourceFile), 'utf8'));
  const files = [sourceFile, 'runtime/setup.cjs', 'runtime/licenses.txt', 'CONTRIBUTING.md', 'doc-resources/repo-devinfo.md', ...outputs.keys()];
  for (const filename of await readdir(path.join(original, '.github/tooling'))) {
    if (/\.(?:mjs|json|ts)$/.test(filename) && filename !== 'git-hooks.test.mjs') files.push(`.github/tooling/${filename}`);
  }
  for (const filename of files) {
    const target = path.join(root, filename);
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, await readFile(path.join(original, filename)));
  }
  const modules = path.join(root, '.github/tooling/node_modules');
  await rm(modules, { recursive: true });
  await symlink(path.join(original, '.github/tooling/node_modules'), modules, process.platform === 'win32' ? 'junction' : 'dir');
  git(root, 'add', ...files);
  git(root, 'commit', '--quiet', '-m', 'real snapshot fixture');
  const before = git(root, 'status', '--porcelain');
  await validateSnapshot(root, { commit: git(root, 'rev-parse', 'HEAD').trim(), full: true });
  assert.equal(git(root, 'status', '--porcelain'), before);
});

test('pre-commit checks staged contributor include without regenerating or using unstaged doc edits', async context => {
  const root = await fixture(context);
  const guide = '<!-- START-INCLUDE:repo-devinfo.md -->\n\nold\n\n<!-- END-INCLUDE:repo-devinfo.md -->\n';
  await mkdir(path.join(root, 'doc-resources'));
  await writeFile(path.join(root, 'CONTRIBUTING.md'), guide);
  await writeFile(path.join(root, 'doc-resources/repo-devinfo.md'), 'old\n');
  await writeFile(path.join(root, '.github/tooling/update-contributing.mjs'), await readFile(new URL('update-contributing.mjs', import.meta.url)));
  git(root, 'add', 'CONTRIBUTING.md', 'doc-resources/repo-devinfo.md', '.github/tooling/update-contributing.mjs');
  await writeFile(path.join(root, 'doc-resources/repo-devinfo.md'), 'new\n');
  await validateSnapshot(root);
  git(root, 'add', 'doc-resources/repo-devinfo.md');
  const index = git(root, 'write-tree');
  await assert.rejects(validateSnapshot(root), /Regenerate explicitly/);
  assert.equal(await readFile(path.join(root, 'CONTRIBUTING.md'), 'utf8'), guide);
  assert.equal(git(root, 'write-tree'), index);
  await writeFile(path.join(root, 'CONTRIBUTING.md'), guide.replace('old', 'new'));
  git(root, 'add', 'CONTRIBUTING.md');
  await validateSnapshot(root);
});