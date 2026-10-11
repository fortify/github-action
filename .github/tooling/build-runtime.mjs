import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../', import.meta.url));
const args = process.argv.slice(2);
if (args.some(arg => arg !== '--check')) throw new Error('Usage: build-runtime.mjs [--check]');
// ncc's module IDs depend on the working directory.
process.chdir(root);
const { default: ncc } = await import('@vercel/ncc');
if (!args.includes('--check')) await mkdir(path.join(root, 'runtime'), { recursive: true });
for (const entry of ['setup', 'run-fcli-ci-action']) {
  const { code, assets } = await ncc(path.join(root, 'src', `${entry}.ts`), {
    minify: false,
    esm: false,
    sourceMap: false,
    cache: false,
    quiet: true,
    license: `${entry}.licenses.txt`,
  });
  const entryCode = entry === 'setup' ? code + '\nif (require.main === module) { module.exports.main(); }\n' : code;
  const outputs = { [`${entry}.cjs`]: entryCode, ...Object.fromEntries(Object.entries(assets)
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
}