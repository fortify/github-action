import assert from 'node:assert/strict';
import test from 'node:test';
import { createRequire } from 'node:module';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import os from 'node:os';

const { setupRequests, runSetup } = createRequire(import.meta.url)('../../runtime/setup.cjs');

test('scan bootstrap preserves tool selection, env export and cache behavior', () => {
  const inputs = { tools: { fcli: 'bootstrapped', 'sc-client': 'skip' }, exportPath: false };
  const request = setupRequests(inputs, { RUNNER_TEMP: '/tmp' });
  assert.deepEqual(request.initArgs, ['init', '--tools', 'fcli:bootstrapped']);
  assert.deepEqual(request.githubArgs, ['github', '--tools', 'fcli', '--excludes=path']);
  assert.equal(request.config.cacheDir, path.join('/tmp', '.fortify', 'fcli', 'bootstrap'));
  assert.equal(setupRequests(inputs, { RUNNER_TOOL_CACHE: '/cache', FCLI_BOOTSTRAP_VERSION: 'v3.14.1' }).config.cacheDir,
    path.join('/cache', 'fortify', 'fcli', 'v3.14.1'));
  assert.equal(setupRequests(inputs, { RUNNER_TEMP: '/tmp', RUNNER_TOOL_CACHE: '/cache', FCLI_BOOTSTRAP_VERSION: 'v3' }).config.cacheDir,
    path.join('/tmp', '.fortify', 'fcli', 'bootstrap'));
});

test('standalone inputs support all tools, definitions and PATH export', () => {
  const request = setupRequests({ tools: { fcli: '3.14.1', 'fod-uploader': 'latest' },
    toolDefinitions: '/custom definitions.zip', exportPath: true }, {});
  assert.deepEqual(request.initArgs, ['init', '--tool-definitions', '/custom definitions.zip', '--tools', 'fcli:3.14.1,fod-uploader:latest']);
  assert.deepEqual(request.githubArgs, ['github', '--tools', 'fcli,fod-uploader']);
  assert.equal(request.config.cacheDir, undefined);
});

test('bootstrap failure stops export; successful setup exports environment', async () => {
  const requests = [];
  const inputs = { tools: { fcli: 'bootstrapped' }, exportPath: false };
  await assert.rejects(runSetup(inputs, async request => { requests.push(request); return { exitCode: 1 }; }), /exit code 1/);
  assert.equal(requests.length, 1);
  requests.length = 0;
  await runSetup(inputs, async request => { requests.push(request); return { exitCode: 0 }; });
  assert.equal(requests.length, 2);
  assert.deepEqual(requests[1].args, ['github', '--tools', 'fcli', '--excludes=path']);
});

test('setup bundle executes standalone setup when launched directly, without tool downloads', async context => {
  const temporary = await mkdtemp(path.join(os.tmpdir(), 'fortify-runtime-entry-'));
  context.after(() => rm(temporary, { recursive: true, force: true }));
  const filename = fileURLToPath(new URL('../../runtime/setup.cjs', import.meta.url));
  assert.throws(() => execFileSync(process.execPath, [filename], {
    encoding: 'utf8',
    env: { ...Object.fromEntries(Object.entries(process.env).filter(([name]) => !name.startsWith('INPUT_'))),
      FCLI_BOOTSTRAP_PATH: process.execPath, FCLI_BOOTSTRAP_VERSION: '',
      RUNNER_TEMP: temporary, 'INPUT_EXPORT-PATH': 'false',
      INPUT_FCLI: 'bootstrapped', 'INPUT_TOOL-DEFINITIONS': '', GITHUB_ENV: path.join(temporary, 'environment'),
      GITHUB_OUTPUT: path.join(temporary, 'output') },
    stdio: 'pipe',
  }), error => error.status === 1 && error.stdout.includes('Setting up Fortify tools...')
    && error.stdout.includes('Fortify setup failed with exit code'));
});