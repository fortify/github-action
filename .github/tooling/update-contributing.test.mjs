import assert from 'node:assert/strict';
import test from 'node:test';
import { mkdtemp, mkdir, readFile, writeFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { renderContributing, updateContributing } from './update-contributing.mjs';

const document = 'Existing agreement\n\n<!-- START-INCLUDE:repo-devinfo.md -->\n\nold\n\n<!-- END-INCLUDE:repo-devinfo.md -->\n\nExisting footer\n';

test('local rendering updates only maintained include and preserves outside edits and CRLF style', () => {
  const rendered = renderContributing(document, 'new instructions\n');
  assert.equal(rendered, document.replace('old', 'new instructions'));
  assert.equal(renderContributing(rendered, 'new instructions\n'), rendered);
  const windows = document.replaceAll('\n', '\r\n');
  assert.equal(renderContributing(windows, 'new instructions\n'), windows.replace('old', 'new instructions'));
});

test('missing, repeated, unordered markers and shared directives fail closed', () => {
  assert.throws(() => renderContributing('no markers', 'text'));
  assert.throws(() => renderContributing(document + '<!-- START-INCLUDE:repo-devinfo.md -->', 'text'));
  assert.throws(() => renderContributing('<!-- END-INCLUDE:repo-devinfo.md --><!-- START-INCLUDE:repo-devinfo.md -->', 'text'));
  assert.throws(() => renderContributing(document, '{{include:remote.md}}'), /shared template directives/);
});

test('check is read-only and explicit generation makes guide current without replacing exterior content', async context => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'contributing-generation-'));
  context.after(() => rm(root, { recursive: true, force: true }));
  await mkdir(path.join(root, 'doc-resources'));
  await writeFile(path.join(root, 'CONTRIBUTING.md'), document);
  await writeFile(path.join(root, 'doc-resources/repo-devinfo.md'), 'new instructions\n');
  await assert.rejects(updateContributing(root, { check: true }), /stale/);
  assert.equal(await readFile(path.join(root, 'CONTRIBUTING.md'), 'utf8'), document);
  await updateContributing(root);
  await updateContributing(root, { check: true });
  assert.equal(await readFile(path.join(root, 'CONTRIBUTING.md'), 'utf8'), document.replace('old', 'new instructions'));
});