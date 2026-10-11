import assert from 'node:assert/strict';
import test from 'node:test';
import { createRequire } from 'node:module';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const { runScan, parseEnvironment, executeScan } = createRequire(import.meta.url)('../../runtime/run-fcli-ci-action.cjs');

test('importing either bundle does not execute standalone setup or scanning', () => {
  for (const entry of ['setup', 'run-fcli-ci-action']) {
    const filename = fileURLToPath(new URL(`../../runtime/${entry}.cjs`, import.meta.url));
    const output = execFileSync(process.execPath, ['-e', 'require(process.argv[1])', filename], {
      encoding: 'utf8', env: { ...process.env, 'INPUT_EXPORT-PATH': 'invalid' },
    });
    assert.equal(output, '');
  }
  const setup = createRequire(import.meta.url)('../../runtime/setup.cjs');
  assert.equal(setup.runScan, undefined);
  assert.equal(setup.parseEnvironment, undefined);
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
  assert.equal(env.DEBRICKED_EXPORT_EXTRA_OPTS, '--publish=true ');
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
