import assert from 'node:assert/strict';
import test from 'node:test';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { runTests } from './run-tests.mjs';

async function fixture(context) {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'fortify tests '));
  context.after(() => rm(directory, { recursive: true, force: true }));
  return directory;
}

test('test discovery uses explicit filenames, including spaces, without shell glob expansion', async context => {
  const directory = await fixture(context);
  await writeFile(path.join(directory, 'example test.test.mjs'), "import test from 'node:test'; test('discovered test', () => {});\n");
  await writeFile(path.join(directory, 'ignored.mjs'), 'throw new Error("must not execute");');
  await mkdir(path.join(directory, 'ignored.test.mjs'));
  assert.equal(await runTests(directory), 0);
});

test('test runner preserves failure exit code', async context => {
  const directory = await fixture(context);
  await writeFile(path.join(directory, 'failure.test.mjs'), 'process.exit(1);\n');
  assert.equal(await runTests(directory), 1);
});

test('empty test discovery fails instead of silently succeeding', async context => {
  await assert.rejects(runTests(await fixture(context)), /No test files/);
});