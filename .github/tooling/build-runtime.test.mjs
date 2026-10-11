import assert from 'node:assert/strict';
import test from 'node:test';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import os from 'node:os';

test('bundle freshness is independent of the build invocation directory', () => {
  const script = fileURLToPath(new URL('build-runtime.mjs', import.meta.url));
  assert.doesNotThrow(() => execFileSync(process.execPath, [script, '--check'], {
    cwd: os.tmpdir(), stdio: 'pipe', timeout: 120000,
  }));
});
