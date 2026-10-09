import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ncc from '@vercel/ncc';

const root = fileURLToPath(new URL('../../', import.meta.url));
const args = process.argv.slice(2);
if (args.some(arg => arg !== '--check')) throw new Error('Usage: build-setup.mjs [--check]');
const { code, assets } = await ncc(fileURLToPath(new URL('setup.ts', import.meta.url)), {
  minify: false,
  esm: false,
  sourceMap: false,
  cache: false,
  quiet: true,
  license: 'licenses.txt',
});
if (!args.includes('--check')) await mkdir(path.join(root, 'runtime'), { recursive: true });
const outputs = { 'setup.cjs': code + '\nif (require.main === module) { module.exports.main(); }\n', ...Object.fromEntries(Object.entries(assets)
  .filter(([filename]) => !filename.endsWith('.d.ts')).map(([filename, asset]) => [filename, asset.source])) };
for (const [filename, content] of Object.entries(outputs)) {
  if (filename.includes('/') || filename.includes('\\') || filename === '..') throw new Error(`Unexpected bundle asset: ${filename}`);
  const target = path.join(root, 'runtime', filename);
  if (args.includes('--check')) {
    if (!Buffer.from(await readFile(target)).equals(Buffer.from(content))) throw new Error(`Generated bundle is stale: ${filename}`);
  } else {
    await writeFile(target, content);
  }
}