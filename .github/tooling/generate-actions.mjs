import { readFile, writeFile, realpath, lstat, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import YAML from 'yaml';

export const sourceFile = '.github/action-src/actions.yml';
export function validateOutputPath(filename) {
  if (!/^(?:[A-Za-z0-9_-][A-Za-z0-9_.-]*\/)*action\.ya?ml$/.test(filename)) throw new Error(`Invalid output path: ${filename}`);
  return filename;
}

export function parseSource(source) {
  const document = YAML.parseDocument(source, { uniqueKeys: true, merge: true });
  if (document.errors.length) throw new Error(document.errors.map(error => error.message).join('\n'));
  const value = document.toJS({ maxAliasCount: 1000 });
  if (!value || Object.keys(value).some(key => !['updates', 'parts', 'outputs'].includes(key))) {
    throw new Error('Invalid action source');
  }
  return { document, value };
}

export function generateActions(source) {
  const { value, document } = parseSource(source);
  const comments = new Map();
  YAML.visit(document, { Map(_key, node) {
    const uses = node.get('uses', true);
    if (YAML.isScalar(uses) && uses.comment) comments.set(uses.value, uses.comment);
  } });
  if (!value.outputs || !Object.keys(value.outputs).length) throw new Error('Missing action outputs');
  const generated = new Map();
  for (const [filename, definition] of Object.entries(value.outputs)) {
    validateOutputPath(filename);
    const action = structuredClone(definition);
    if (action.runs?.using !== 'composite' || !Array.isArray(action.runs.steps)) {
      throw new Error(`${filename}: expected composite steps`);
    }
    action.runs.steps = action.runs.steps.flat(1);
    const ids = new Set();
    for (const step of action.runs.steps) {
      if (!step || typeof step !== 'object' || Array.isArray(step)) throw new Error(`${filename}: invalid step group`);
      if (step.id) {
        if (!/^[A-Za-z_][A-Za-z0-9_-]*$/.test(step.id) || ids.has(step.id)) throw new Error(`${filename}: invalid or duplicate step id`);
        ids.add(step.id);
      }
      delete step['x-update-policy'];
      const repositoryPaths = step['x-repository-paths'];
      if (repositoryPaths !== undefined) {
        if (!repositoryPaths || typeof repositoryPaths !== 'object' || Array.isArray(repositoryPaths)) throw new Error(`${filename}: invalid repository paths`);
        step.env ??= {};
        for (const [variable, relative] of Object.entries(repositoryPaths)) {
          if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(variable) || typeof relative !== 'string'
              || !/^[\w.-]+(?:\/[\w.-]+)*$/.test(relative)
              || relative.split('/').some(part => ['.', '..'].includes(part))) throw new Error(`${filename}: invalid repository path`);
          step.env[variable] = '${{ github.action_path }}/' + path.posix.relative(path.posix.dirname(filename), relative);
        }
        delete step['x-repository-paths'];
      }
      if (Boolean(step.uses) === Boolean(step.run)) throw new Error(`${filename}: step needs either uses or run`);
      if (step.uses && (!/^[\w-]+\/[\w.-]+(?:\/[\w.-]+)*@[a-f0-9]{40}$/.test(step.uses)
          || step.uses.startsWith('fortify/github-action@') || step.uses.startsWith('fortify/github-action/'))) {
        throw new Error(`${filename}: external action must use a full SHA; internal actions are forbidden`);
      }
      if (step.run && !step.shell) throw new Error(`${filename}: run step requires shell`);
    }
    const serialized = YAML.stringify(action, { aliasDuplicateObjects: false, lineWidth: 0 });
    for (const match of serialized.matchAll(/\bsteps\.([A-Za-z_][A-Za-z0-9_-]*)\./g)) {
      if (!ids.has(match[1])) throw new Error(`${filename}: unknown step reference: ${match[1]}`);
    }
    if (action.outputs && !Object.keys(action.outputs).length) delete action.outputs;
    const output = new YAML.Document(action, { aliasDuplicateObjects: false });
    action.runs.steps.forEach((step, index) => {
      if (step.uses && comments.has(step.uses)) output.getIn(['runs', 'steps', index, 'uses'], true).comment = comments.get(step.uses);
    });
    generated.set(filename, '# AUTO-GENERATED FILE - DO NOT EDIT MANUALLY.\n'
      + '# Source: .github/action-src/actions.yml\n'
      + '# Regenerate: npm run generate --prefix .github/tooling\n'
      + output.toString({ lineWidth: 0 }));
  }
  return generated;
}

export async function generateRepository(root, { check = false } = {}) {
  const generated = generateActions(await readFile(path.join(root, sourceFile), 'utf8'));
  const canonicalRoot = await realpath(root);
  const mismatches = [];
  for (const [filename, content] of generated) {
    let target = canonicalRoot;
    let missing = false;
    const parts = filename.split('/');
    for (const [index, part] of parts.entries()) {
      target = path.join(target, part);
      const final = index === parts.length - 1;
      try {
        const entry = await lstat(target);
        if (entry.isSymbolicLink()) throw new Error(`Output path contains a symlink: ${filename}`);
        if (final ? !entry.isFile() : !entry.isDirectory()) throw new Error(`Output path has an invalid file type: ${filename}`);
      } catch (error) {
        if (error.code !== 'ENOENT') throw error;
        if (check) { missing = true; break; }
        if (!final) await mkdir(target);
      }
    }
    if (check) {
      if (missing || await readFile(target, 'utf8') !== content) mismatches.push(filename);
    } else {
      await writeFile(target, content);
    }
  }
  if (mismatches.length) throw new Error(`Generated actions are stale: ${mismatches.join(', ')}`);
  return generated;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  if (args.some(arg => arg !== '--check')) throw new Error('Usage: generate-actions.mjs [--check]');
  generateRepository(fileURLToPath(new URL('../../', import.meta.url)), { check: args.includes('--check') })
    .catch(error => { console.error(error.message); process.exitCode = 1; });
}