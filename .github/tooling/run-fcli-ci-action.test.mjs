import assert from 'node:assert/strict';
import test from 'node:test';
import { createRequire } from 'node:module';
import path from 'node:path';
import os from 'node:os';
import { execFileSync } from 'node:child_process';
import { mkdir, mkdtemp, readdir, readFile, rm, symlink, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { TextWriter, Uint8ArrayReader, ZipReader } from '@zip.js/zip.js';

const { runScan, parseEnvironment, executeScan, createDebugArtifactsZip } =
  createRequire(import.meta.url)('../../runtime/run-fcli-ci-action.cjs');

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

async function tempDirectory(t) {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'fortify-scan-test-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  return directory;
}

async function scanFixture(t, { fail = false, debug = 'false', password = 'test-password' } = {}) {
  const temp = await tempDirectory(t);
  const outputs = {};
  const calls = [];
  const warnings = [];
  const secrets = [];
  const env = { RUNNER_TEMP: temp, GITHUB_ENV: '/env', RUNNER_DEBUG: debug, FORTIFY_DEBUG_ARTIFACT_NAME: 'debug-job',
    FORTIFY_DEBUG_ARTIFACT_PASSWORD: password, SAST_EXPORT_EXTRA_OPTS: '--existing=true', GITHUB_TOKEN: 'test-token' };
  let initialized = false;
  return { temp, outputs, calls, warnings, secrets, services: {
    env,
    core: {
      exportVariable: (name, value) => { env[name] = value; },
      setOutput: (name, value) => { outputs[name] = value; },
      setSecret: value => { secrets.push(value); },
      warning: message => { warnings.push(message); },
      info: () => {},
    },
    readEnvironment: async () => initialized ? 'OLD=untouched\nFCLI_CMD=/tools/fcli\nTOOL_HOME=/tools\n' : 'OLD=untouched\n',
    setup: async inputs => { calls.push(inputs); initialized = true; return '/fallback/fcli'; },
    mkdir: async (directory, options) => { calls.push(directory); await mkdir(directory, options); },
    execute: async (...args) => {
      calls.push(args);
      await writeFile(path.join(args[2], 'fcli.log'), 'fcli log contents');
      await writeFile(path.join(args[2], '.hidden'), 'hidden contents');
      if (fail) throw new Error('scan failed');
    },
  } };
}

// Returns the WinZip AES encryption strength (3 = AES-256) from the local file header of the first zip entry
function aesStrength(bytes) {
  assert.equal(bytes.readUInt16LE(8), 99);
  for (let offset = 30 + bytes.readUInt16LE(26), end = offset + bytes.readUInt16LE(28); offset < end;
    offset += 4 + bytes.readUInt16LE(offset + 2)) {
    if (bytes.readUInt16LE(offset) === 0x9901) return bytes[offset + 8];
  }
}

// Lists the per-scan directory exposed through the deprecated debug-artifacts-dir output
async function debugArtifactFiles(fixture) {
  const directory = fixture.outputs['debug-artifacts-dir'];
  assert.equal(path.dirname(directory), fixture.temp);
  assert.match(path.basename(directory), /^fortify-debug-artifacts-/);
  return readdir(directory);
}

async function assertReadmeZip(fixture) {
  assert.equal(fixture.outputs['upload-debug-artifacts'], 'true');
  assert.deepEqual(await debugArtifactFiles(fixture), ['debug-job.zip']);
  const zipFile = fixture.outputs['debug-artifacts-zip'];
  assert.equal(zipFile, path.join(fixture.outputs['debug-artifacts-dir'], 'debug-job.zip'));
  const reader = new ZipReader(new Uint8ArrayReader(new Uint8Array(await readFile(zipFile))), { useWebWorkers: false });
  try {
    const entries = await reader.getEntries();
    assert.deepEqual(entries.map(entry => [entry.filename, entry.encrypted]), [['README.txt', false]]);
    const readme = await entries[0].getData(new TextWriter());
    assert.match(readme, /debug-artifact-password/);
    assert.doesNotMatch(readme, /fcli log contents|hidden contents|test-password/);
  } finally {
    await reader.close();
  }
}

test('single-step scan imports setup env, uses argument array, and preserves publish opts and token', async t => {
  const fixture = await scanFixture(t);
  await runScan('true', fixture.services);
  const [command, args, directory, env] = fixture.calls[2];
  assert.equal(command, '/tools/fcli');
  assert.deepEqual(args, ['action', 'run', 'ci', '--debug=true']);
  assert.equal(directory, path.join(fixture.temp, 'fortify-data'));
  assert.equal(env.TOOL_HOME, '/tools');
  assert.equal(env.OLD, undefined);
  assert.equal(env.GITHUB_TOKEN, 'test-token');
  assert.equal(env.SAST_EXPORT_EXTRA_OPTS, '--publish=true --existing=true');
  assert.equal(env.DEBRICKED_EXPORT_EXTRA_OPTS, '--publish=true ');
  assert.equal(fixture.outputs['upload-debug-artifacts'], 'true');
});

test('debug artifacts are packaged as AES-256 encrypted zip without exposing the password', async t => {
  const fixture = await scanFixture(t);
  await runScan('true', fixture.services);
  assert.equal(fixture.calls[2][3].FORTIFY_DEBUG_ARTIFACT_PASSWORD, undefined);
  assert.equal(fixture.services.env.FORTIFY_DEBUG_ARTIFACT_PASSWORD, undefined);
  assert.deepEqual(fixture.secrets, ['test-password']);
  assert.deepEqual(fixture.warnings, []);
  const zipFile = fixture.outputs['debug-artifacts-zip'];
  assert.deepEqual(await debugArtifactFiles(fixture), ['debug-job.zip']);
  assert.equal(zipFile, path.join(fixture.outputs['debug-artifacts-dir'], 'debug-job.zip'));
  const bytes = await readFile(zipFile);
  assert.equal(aesStrength(bytes), 3);
  const reader = new ZipReader(new Uint8ArrayReader(new Uint8Array(bytes)), { useWebWorkers: false });
  const entries = await reader.getEntries();
  assert.deepEqual(entries.map(entry => [entry.filename, entry.encrypted, entry.zipCrypto]), [['fcli.log', true, false]]);
  await assert.rejects(entries[0].getData(new TextWriter(), { password: 'wrong-password' }));
  assert.equal(await entries[0].getData(new TextWriter(), { password: 'test-password' }), 'fcli log contents');
  await reader.close();
});

test('debugging without a password uploads only an unencrypted README zip', async t => {
  for (const [debugInput, runnerDebug] of [['true', 'false'], ['false', '1']]) {
    const fixture = await scanFixture(t, { debug: runnerDebug, password: '' });
    fixture.services.createZip = async () => assert.fail('Debug data must not be packaged without a password');
    await runScan(debugInput, fixture.services);
    assert.deepEqual(fixture.calls[2][1], ['action', 'run', 'ci', '--debug=false']);
    assert.equal(fixture.warnings.length, 1);
    assert.match(fixture.warnings[0], /debug-artifact-password/);
    assert.deepEqual(fixture.secrets, []);
    await assertReadmeZip(fixture);
  }
});

test('disabled debugging never requests an upload, with or without a password', async t => {
  for (const password of ['', 'test-password']) {
    const fixture = await scanFixture(t, { password });
    await runScan('false', fixture.services);
    assert.deepEqual(fixture.calls[2][1], ['action', 'run', 'ci', '--debug=false']);
    assert.deepEqual(fixture.warnings, []);
    assert.equal(fixture.outputs['upload-debug-artifacts'], 'false');
    assert.equal(fixture.outputs['debug-artifacts-zip'], '');
    assert.deepEqual(await debugArtifactFiles(fixture), ['README.txt']);
  }
});

test('scan and setup failures still set outputs; runner debug enables collection', async t => {
  const fixture = await scanFixture(t, { fail: true, debug: '1' });
  await assert.rejects(runScan('false', fixture.services), /scan failed/);
  assert.equal(fixture.outputs['upload-debug-artifacts'], 'true');
  assert.equal(fixture.outputs['debug-artifacts-zip'], path.join(fixture.outputs['debug-artifacts-dir'], 'debug-job.zip'));
  const setupFailure = await scanFixture(t);
  setupFailure.services.setup = async () => { throw new Error('setup failed'); };
  await assert.rejects(runScan('true', setupFailure.services), /setup failed/);
  await assertReadmeZip(setupFailure);
  assert.equal(setupFailure.calls.length, 0);
});

test('debug artifact packaging problems result in warnings without masking scan failures', async t => {
  const zipFailure = await scanFixture(t, { fail: true, debug: '1' });
  zipFailure.services.createZip = async () => { throw new Error('zip failed'); };
  await assert.rejects(runScan('false', zipFailure.services), /scan failed/);
  const noFiles = await scanFixture(t);
  noFiles.services.execute = async () => {};
  await runScan('true', noFiles.services);
  for (const [fixture, warning] of [[zipFailure, /zip failed/], [noFiles, /No debug artifact files/]]) {
    assert.equal(fixture.warnings.length, 1);
    assert.match(fixture.warnings[0], warning);
    await assertReadmeZip(fixture);
  }
  const invalidName = await scanFixture(t);
  invalidName.services.env.FORTIFY_DEBUG_ARTIFACT_NAME = 'invalid/name';
  await runScan('true', invalidName.services);
  assert.equal(invalidName.warnings.length, 1);
  assert.match(invalidName.warnings[0], /invalid debug artifact name/);
  assert.equal(invalidName.outputs['upload-debug-artifacts'], 'false');
  assert.equal(invalidName.outputs['debug-artifacts-zip'], '');
  assert.deepEqual(await debugArtifactFiles(invalidName), ['README.txt']);
});

test('failure to prepare even the README fallback does not expose an unusable upload or mask scan failures', async t => {
  const readmeFailure = await scanFixture(t, { fail: true, password: '' });
  readmeFailure.services.createReadmeZip = async () => { throw new Error('README zip failed'); };
  await assert.rejects(runScan('true', readmeFailure.services), /scan failed/);
  assert.equal(readmeFailure.warnings.length, 2);
  assert.match(readmeFailure.warnings[1], /README zip failed/);
  assert.deepEqual([readmeFailure.outputs['upload-debug-artifacts'], readmeFailure.outputs['debug-artifacts-dir'],
    readmeFailure.outputs['debug-artifacts-zip']], ['false', '', '']);
  const directoryFailure = await scanFixture(t);
  await writeFile(path.join(directoryFailure.temp, 'file'), '');
  directoryFailure.services.env.RUNNER_TEMP = path.join(directoryFailure.temp, 'file');
  directoryFailure.services.setup = async () => { throw new Error('setup failed'); };
  await assert.rejects(runScan('true', directoryFailure.services), /setup failed/);
  assert.equal(directoryFailure.warnings.length, 1);
  assert.match(directoryFailure.warnings[0], /error preparing debug artifacts directory/);
  assert.deepEqual([directoryFailure.outputs['upload-debug-artifacts'], directoryFailure.outputs['debug-artifacts-dir'],
    directoryFailure.outputs['debug-artifacts-zip']], ['false', '', '']);
});

test('debug artifacts zip follows symbolic links, ignoring broken links and loops', {
  skip: process.platform === 'win32' && 'creating symbolic links may require elevated privileges on Windows',
}, async t => {
  const temp = await tempDirectory(t);
  const directory = path.join(temp, 'data');
  await mkdir(path.join(directory, 'sub'), { recursive: true });
  await writeFile(path.join(directory, 'sub', 'file.txt'), 'nested contents');
  await symlink(directory, path.join(directory, 'sub', 'loop'));
  await symlink(path.join(temp, 'missing'), path.join(directory, 'broken'));
  const zipFile = path.join(temp, 'debug.zip');
  assert.equal(await createDebugArtifactsZip(directory, zipFile, 'test-password'), 1);
  const reader = new ZipReader(new Uint8ArrayReader(new Uint8Array(await readFile(zipFile))), { useWebWorkers: false });
  assert.deepEqual((await reader.getEntries()).map(entry => entry.filename), ['sub/file.txt']);
  await reader.close();
  assert.equal(await createDebugArtifactsZip(path.join(temp, 'missing'), path.join(temp, 'missing.zip'), 'test-password'), 0);
  await assert.rejects(createDebugArtifactsZip(directory, zipFile, ''), /password/);
});

test('subprocess forwards exit failure and does not interpret shell arguments', async () => {
  await executeScan(process.execPath, ['-e', 'process.exit(0)', '$(exit 1)'], process.cwd(), process.env);
  await assert.rejects(executeScan(process.execPath, ['-e', 'process.exit(7)'], process.cwd(), process.env), /exit code 7/);
});
