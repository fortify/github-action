import assert from 'node:assert/strict';
import test from 'node:test';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import os from 'node:os';

test('Git keeps source and generated runtime files LF even with core.autocrlf enabled', () => {
  const root = fileURLToPath(new URL('../../', import.meta.url));
  const files = [
    'src/setup.ts', 'src/run-fcli-ci-action.ts',
    'runtime/setup.cjs', 'runtime/run-fcli-ci-action.cjs',
    'runtime/setup.licenses.txt', 'runtime/run-fcli-ci-action.licenses.txt',
  ];
  const output = execFileSync('git', ['-c', 'core.autocrlf=true', 'check-attr', 'eol', '--', ...files], {
    cwd: root, encoding: 'utf8',
  });
  assert.deepEqual(output.trim().split(/\r?\n/), files.map(filename => `${filename}: eol: lf`));
});

test('bundle freshness is independent of the build invocation directory', () => {
  const script = fileURLToPath(new URL('build-runtime.mjs', import.meta.url));
  assert.doesNotThrow(() => execFileSync(process.execPath, [script, '--check'], {
    cwd: os.tmpdir(), stdio: 'pipe', timeout: 120000,
  }));
});
