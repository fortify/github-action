import { readFile, writeFile, lstat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export function renderContributing(document, fragment) {
  const start = '<!-- START-INCLUDE:repo-devinfo.md -->';
  const end = '<!-- END-INCLUDE:repo-devinfo.md -->';
  const startIndex = document.indexOf(start);
  const endIndex = document.indexOf(end);
  if (startIndex < 0 || endIndex <= startIndex || document.indexOf(start, startIndex + start.length) >= 0
      || document.indexOf(end, endIndex + end.length) >= 0) throw new Error('Contributor guide needs one ordered repo-devinfo include');
  if (/\{\{(?:var|include):/.test(fragment)) throw new Error('Local contributor generation cannot expand shared template directives');
  const newline = document.includes('\r\n') ? '\r\n' : '\n';
  const body = fragment.replace(/\r\n/g, '\n').trimEnd().replaceAll('\n', newline);
  return document.slice(0, startIndex + start.length) + newline + newline + body + newline + newline + document.slice(endIndex);
}

export async function updateContributing(root, { check = false } = {}) {
  const target = path.join(root, 'CONTRIBUTING.md');
  const entry = await lstat(target);
  if (!entry.isFile() || entry.isSymbolicLink()) throw new Error('Contributor guide must be a regular file');
  const document = await readFile(target, 'utf8');
  const fragment = await readFile(path.join(root, 'doc-resources/repo-devinfo.md'), 'utf8');
  const generated = renderContributing(document, fragment);
  if (generated === document) return;
  if (check) throw new Error('Contributor guide is stale. Run npm run docs:contributing --prefix .github/tooling, review, and stage the guide.');
  await writeFile(target, generated);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  if (args.length > 1 || args.some(arg => arg !== '--check')) throw new Error('Usage: update-contributing.mjs [--check]');
  updateContributing(fileURLToPath(new URL('../../', import.meta.url)), { check: args.includes('--check') })
    .catch(error => { console.error(error.message); process.exitCode = 1; });
}