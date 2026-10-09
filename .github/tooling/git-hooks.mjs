import { execFileSync } from 'node:child_process';
import { mkdtemp, mkdir, readFile, readdir, realpath, rm, symlink, writeFile, cp } from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const hooksPath = '.github/tooling/hooks';
const toolingPath = '.github/tooling';
const zeroRef = /^0+$/;

function git(root, args, env = process.env) {
  return execFileSync('git', args, { cwd: root, env, encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 });
}

export async function installHooks(root) {
  let configured;
  try {
    configured = git(root, ['config', '--get', 'core.hooksPath']).trim();
  } catch (error) {
    if (error.status !== 1) throw error;
  }
  if (configured === hooksPath) return;
  if (configured) throw new Error(`Existing core.hooksPath (${configured}) was not changed. Integrate these checks into your existing hooks instead.`);
  const directory = git(root, ['rev-parse', '--git-path', 'hooks']).trim();
  let files;
  try {
    files = await readdir(path.resolve(root, directory));
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    files = [];
  }
  const active = files.filter(filename => !filename.endsWith('.sample'));
  if (active.length) throw new Error(`Existing hooks (${active.join(', ')}) were not disabled. Review/remove them or integrate these checks before enabling repository hooks.`);
  git(root, ['config', '--local', 'core.hooksPath', hooksPath]);
}

export function pushedCommits(input) {
  const commits = new Set();
  for (const line of input.trim().split(/\r?\n/)) {
    if (!line) continue;
    const fields = line.split(/\s+/);
    if (fields.length !== 4 || !/^(?:[a-f0-9]{40}|[a-f0-9]{64})$/.test(fields[1])) throw new Error('Invalid pre-push ref input');
    if (!zeroRef.test(fields[1])) commits.add(fields[1]);
  }
  return [...commits];
}

export async function validateSnapshot(root, { commit, full = false } = {}) {
  const temporary = await mkdtemp(path.join(os.tmpdir(), 'fortify-action-hooks-'));
  try {
    const env = { ...process.env };
    if (commit) {
      if (!/^(?:[a-f0-9]{40}|[a-f0-9]{64})$/.test(commit)) throw new Error('Invalid commit id');
      env.GIT_INDEX_FILE = path.join(temporary, 'index');
      git(root, ['read-tree', `${commit}^{commit}`], env);
    }
    const entries = git(root, ['ls-files', '--stage', '-z'], env).split('\0').filter(Boolean).map(entry => {
      const match = /^(100(?:644|755)) ([a-f0-9]+) 0\t/.exec(entry);
      if (!match) throw new Error('Hook snapshot requires regular files and a conflict-free index');
      const filename = entry.slice(entry.indexOf('\t') + 1);
      if (filename.includes('\\') || filename.split('/').some(part => ['.', '..', '.git'].includes(part.toLowerCase()))
          || path.isAbsolute(filename)) throw new Error('Unsafe snapshot path');
      return { filename, hash: match[2], mode: match[1] };
    });
    const snapshot = path.join(temporary, 'snapshot');
    const blobs = execFileSync('git', ['cat-file', '--batch'], {
      cwd: root, env, input: entries.map(entry => entry.hash).join('\n') + '\n', maxBuffer: 32 * 1024 * 1024,
    });
    let offset = 0;
    for (const entry of entries) {
      const headerEnd = blobs.indexOf(10, offset);
      const header = blobs.subarray(offset, headerEnd).toString('utf8').split(' ');
      const size = Number(header[2]);
      if (headerEnd < 0 || header[0] !== entry.hash || header[1] !== 'blob' || !Number.isSafeInteger(size)
          || size < 0 || headerEnd + size + 1 >= blobs.length) throw new Error('Invalid snapshot blob');
      const target = path.join(snapshot, entry.filename);
      await mkdir(path.dirname(target), { recursive: true });
      await writeFile(target, blobs.subarray(headerEnd + 1, headerEnd + 1 + size), { mode: entry.mode === '100755' ? 0o755 : 0o644 });
      offset = headerEnd + size + 2;
    }
    const originalTooling = path.join(root, toolingPath);
    const snapshotTooling = path.join(snapshot, toolingPath);
    const modules = await realpath(path.join(originalTooling, 'node_modules'));
    const lock = JSON.parse(await readFile(path.join(snapshotTooling, 'package-lock.json'), 'utf8'));
    const installed = JSON.parse(await readFile(path.join(modules, '.package-lock.json'), 'utf8'));
    const manifest = JSON.parse(await readFile(path.join(snapshotTooling, 'package.json'), 'utf8'));
    for (const field of ['dependencies', 'devDependencies']) {
      const expected = Object.entries(manifest[field] ?? {}).sort();
      const locked = Object.entries(lock.packages?.['']?.[field] ?? {}).sort();
      if (JSON.stringify(expected) !== JSON.stringify(locked)) throw new Error('Snapshot package.json and lockfile disagree. Update and stage the lockfile explicitly.');
    }
    for (const [name, dependency] of Object.entries(lock.packages ?? {})) {
      if (!name) continue;
      if (['version', 'resolved', 'integrity'].some(field => dependency[field] !== installed.packages?.[name]?.[field])) {
        throw new Error('Installed dependencies do not match snapshot lockfile. Run npm ci --prefix .github/tooling with the intended lockfile; hooks never install dependencies.');
      }
    }
    if (full) {
      await cp(modules, path.join(snapshotTooling, 'node_modules'), { recursive: true, dereference: true });
    } else {
      await symlink(modules, path.join(snapshotTooling, 'node_modules'), process.platform === 'win32' ? 'junction' : 'dir');
    }
    const childEnv = { ...process.env };
    delete childEnv.NODE_TEST_CONTEXT;
    const run = args => execFileSync(process.execPath, args, { cwd: snapshotTooling, env: childEnv, stdio: 'inherit' });
    run(['generate-actions.mjs', '--check']);
    const files = new Set(entries.map(entry => entry.filename));
    if (['CONTRIBUTING.md', 'doc-resources/repo-devinfo.md', '.github/tooling/update-contributing.mjs'].every(filename => files.has(filename))) {
      run(['update-contributing.mjs', '--check']);
    }
    if (full) {
      run(['build-setup.mjs', '--check']);
      run(['node_modules/typescript/bin/tsc', '--noEmit']);
      const tests = (await readdir(snapshotTooling)).filter(filename => filename.endsWith('.test.mjs')).sort();
      if (!tests.length) throw new Error('Snapshot has no offline tests');
      run(['--test', ...tests]);
    }
    const changed = commit ? git(root, ['diff-tree', '--root', '--no-commit-id', '--name-only', '-r', `${commit}^{commit}`])
      : git(root, ['diff', '--cached', '--name-only']);
    if (changed.split('\n').some(filename => filename.startsWith('doc-resources/') || filename === 'version.txt')) {
      console.warn('Documentation reminder: review generated docs and stage intended changes. The contributor include is checked locally; other docs/shared templates require explicit bash doc-resources/update-repo-docs.sh generation.');
    }
  } catch (error) {
    throw new Error(`${error.message}\nRegenerate explicitly: npm run generate --prefix .github/tooling; npm run docs:contributing --prefix .github/tooling. Review and stage outputs yourself. Hooks never generate or stage files.`, { cause: error });
  } finally {
    await rm(temporary, { recursive: true, force: true });
  }
}

async function main() {
  const root = git(process.cwd(), ['rev-parse', '--show-toplevel']).trim();
  const [mode, ...extra] = process.argv.slice(2);
  if (extra.length) throw new Error('Unexpected hook arguments');
  if (mode === '--install') {
    await installHooks(root);
    console.log(`Enabled validation hooks through ${hooksPath}. No generated files or index entries were changed.`);
  } else if (mode === '--pre-commit') {
    await validateSnapshot(root);
  } else if (mode === '--pre-push') {
    for (const commit of pushedCommits(readFileSync(0, 'utf8'))) await validateSnapshot(root, { commit, full: true });
  } else {
    throw new Error('Usage: git-hooks.mjs --install | --pre-commit | --pre-push');
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(error => { console.error(error.message); process.exitCode = 1; });
}