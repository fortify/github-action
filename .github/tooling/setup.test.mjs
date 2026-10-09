import assert from 'node:assert/strict';
import test from 'node:test';
import { createRequire } from 'node:module';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import os from 'node:os';

const { setupRequests, runSetup, runScan, parseEnvironment, executeScan } = createRequire(import.meta.url)('../../runtime/setup.cjs');

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

test('environment import supports equals, CRLF and multiline values without evaluation', () => {
  const values = parseEnvironment('FCLI_CMD=/tools/fcli\r\nOPTIONS=a=b\r\nMULTI<<end\r\none\r\ntwo\r\nend\r\n');
  assert.equal(values.FCLI_CMD, '/tools/fcli');
  assert.equal(values.OPTIONS, 'a=b');
  assert.equal(values.MULTI, 'one\ntwo');
  assert.throws(() => parseEnvironment('KEY<<end\nmissing'), /Unterminated/);
  assert.throws(() => parseEnvironment('invalid'), /Invalid/);
});

function scanFixture(fail = false, debug = 'false') {
  const outputs = {};
  const calls = [];
  const env = { RUNNER_TEMP: '/tmp', GITHUB_ENV: '/env', RUNNER_DEBUG: debug,
    SAST_EXPORT_EXTRA_OPTS: '--existing=true', GITHUB_TOKEN: 'test-token' };
  let initialized = false;
  return { outputs, calls, services: {
    env,
    core: { exportVariable: (name, value) => { env[name] = value; }, setOutput: (name, value) => { outputs[name] = value; } },
    readEnvironment: async () => initialized ? 'OLD=untouched\nFCLI_CMD=/tools/fcli\nTOOL_HOME=/tools\n' : 'OLD=untouched\n',
    setup: async inputs => { calls.push(inputs); initialized = true; return '/fallback/fcli'; },
    mkdir: async directory => { calls.push(directory); },
    execute: async (...args) => { calls.push(args); if (fail) throw new Error('scan failed'); },
  } };
}

test('single-step scan imports setup env, uses argument array, and preserves publish opts and token', async () => {
  const fixture = scanFixture();
  await runScan('true', fixture.services);
  const [command, args, directory, env] = fixture.calls[2];
  assert.equal(command, '/tools/fcli');
  assert.deepEqual(args, ['action', 'run', 'ci', '--debug=true']);
  assert.equal(directory, path.join('/tmp', 'fortify-data'));
  assert.equal(env.TOOL_HOME, '/tools');
  assert.equal(env.OLD, undefined);
  assert.equal(env.GITHUB_TOKEN, 'test-token');
  assert.equal(env.SAST_EXPORT_EXTRA_OPTS, '--publish=true --existing=true');
  assert.equal(fixture.outputs['upload-debug-artifacts'], 'true');
  assert.equal(fixture.outputs['debug-artifacts-dir'], directory);
});

test('scan and setup failures still set outputs; runner debug enables collection', async () => {
  const fixture = scanFixture(true, '1');
  await assert.rejects(runScan('false', fixture.services), /scan failed/);
  assert.equal(fixture.outputs['upload-debug-artifacts'], 'true');
  const setupFailure = scanFixture();
  setupFailure.services.setup = async () => { throw new Error('setup failed'); };
  await assert.rejects(runScan('false', setupFailure.services), /setup failed/);
  assert.equal(setupFailure.outputs['upload-debug-artifacts'], 'false');
  assert.equal(setupFailure.outputs['debug-artifacts-dir'], path.join('/tmp', 'fortify-data'));
  assert.equal(setupFailure.calls.length, 0);
});

test('subprocess forwards exit failure and does not interpret shell arguments', async () => {
  await executeScan(process.execPath, ['-e', 'process.exit(0)', '$(exit 1)'], process.cwd(), process.env);
  await assert.rejects(executeScan(process.execPath, ['-e', 'process.exit(7)'], process.cwd(), process.env), /exit code 7/);
});

test('shared runtime executes standalone setup when launched directly, without tool downloads', async context => {
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