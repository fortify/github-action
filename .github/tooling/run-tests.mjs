import { readdir } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export async function runTests(directory) {
  const files = (await readdir(directory, { withFileTypes: true }))
    .filter(entry => entry.isFile() && entry.name.endsWith('.test.mjs'))
    .map(entry => entry.name).sort();
  if (!files.length) throw new Error('No test files found');
  const env = { ...process.env };
  delete env.NODE_TEST_CONTEXT;
  const result = spawnSync(process.execPath, ['--test', ...files], {
    cwd: directory, env, stdio: 'inherit', shell: false,
  });
  if (result.error) throw result.error;
  if (result.signal) throw new Error(`Test runner terminated by signal ${result.signal}`);
  return result.status ?? 1;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  runTests(fileURLToPath(new URL('.', import.meta.url)))
    .then(status => { process.exitCode = status; })
    .catch(error => { console.error(error.message); process.exitCode = 1; });
}