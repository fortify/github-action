import semver from 'semver';
import { readdir, readFile, writeFile, realpath } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import YAML from 'yaml';

export function parseReleaseTag(tag) {
  const match = /^v?(\d+\.\d+\.\d+)(-node\d+)?$/.exec(tag);
  if (!match || !semver.valid(match[1])) return undefined;
  return { version: match[1], variant: match[2] ?? '' };
}

export function selectRelease(releases, policy = {}, now = Date.now(), ageDays = 7) {
  const cutoff = now - ageDays * 86400000;
  return releases
    .filter(release => {
      const parsed = parseReleaseTag(release.tag_name);
      const published = Date.parse(release.published_at);
      return parsed && !release.draft && !release.prerelease
        && Number.isFinite(published) && published <= cutoff
        && parsed.variant === (policy.tagVariant ?? '')
        && (!policy.allowedMajors || policy.allowedMajors.includes(semver.major(parsed.version)));
    })
    .sort((left, right) => semver.rcompare(
      parseReleaseTag(left.tag_name).version, parseReleaseTag(right.tag_name).version,
    ))[0];
}

export function validateManifest(manifest) {
  if (!manifest || !Number.isInteger(manifest.minimumReleaseAgeDays)
      || manifest.minimumReleaseAgeDays < 0 || manifest.minimumReleaseAgeDays > 365) {
    throw new Error('minimumReleaseAgeDays must be an integer between 0 and 365');
  }
  if (Object.keys(manifest).some(key => !['minimumReleaseAgeDays', 'overrides'].includes(key))) {
    throw new Error('Unknown manifest setting');
  }
  for (const [directory, actions] of Object.entries(manifest.overrides ?? {})) {
    if (directory !== '.' && !/^[\w-]+(?:\/[\w-]+)*$/.test(directory)) {
      throw new Error(`Invalid override directory: ${directory}`);
    }
    for (const [action, policy] of Object.entries(actions)) {
      if (!/^[\w-]+\/[\w.-]+(?:\/[\w.-]+)*$/.test(action)
          || action.split('/').some(segment => segment === '.' || segment === '..')) {
        throw new Error(`Invalid override action: ${action}`);
      }
      if (Object.keys(policy).some(key => !['allowedMajors', 'tagVariant'].includes(key))) {
        throw new Error(`Unknown policy setting for ${action}`);
      }
      if (policy.allowedMajors && (!Array.isArray(policy.allowedMajors) || !policy.allowedMajors.length
          || policy.allowedMajors.some(major => !Number.isInteger(major) || major < 1))) {
        throw new Error(`Invalid allowedMajors for ${action}`);
      }
      if (policy.tagVariant !== undefined && !/^(-node\d+)?$/.test(policy.tagVariant)) {
        throw new Error(`Invalid tagVariant for ${action}`);
      }
    }
  }
  return manifest;
}

export function parseActionDocument(source) {
  const document = YAML.parseDocument(source, { uniqueKeys: true });
  if (document.errors.length) throw new Error(document.errors.map(error => error.message).join('\n'));
  document.toJS({ maxAliasCount: 0 });
  return document;
}

export function discoverReferences(source, file) {
  const document = parseActionDocument(source);
  const steps = document.getIn(['runs', 'steps'], true);
  if (!steps) return [];
  if (!YAML.isSeq(steps)) throw new Error(`${file}: runs.steps must be a sequence`);
  return steps.items.flatMap(step => {
    if (!YAML.isMap(step)) throw new Error(`${file}: invalid action step`);
    const uses = step.get('uses', true);
    if (!uses) return [];
    if (!YAML.isScalar(uses) || typeof uses.value !== 'string') throw new Error(`${file}: invalid uses`);
    if (uses.value.startsWith('./') || uses.value.startsWith('docker://') || uses.value.startsWith('fortify/')) return [];
    const match = /^([\w-]+\/[\w.-]+(?:\/[\w.-]+)*)@([a-f0-9]{40})$/.exec(uses.value);
    if (!match || match[1].split('/').some(segment => ['.', '..'].includes(segment))) {
      throw new Error(`${file}: third-party reference must use a full SHA: ${uses.value}`);
    }
    const tag = uses.comment?.trim();
    if (!tag || !parseReleaseTag(tag)) throw new Error(`${file}: ${match[1]} needs an exact release comment`);
    return [{ file, step, uses, action: match[1], sha: match[2], tag }];
  });
}

export function planConfiguration(step, current, candidate) {
  const values = step.get('with')?.toJSON() ?? {};
  const additions = {};
  const warnings = [];
  for (const name of Object.keys(values)) {
    if (!Object.hasOwn(candidate.inputs ?? {}, name)) warnings.push(`Input ${name} was removed; manual migration required.`);
  }
  for (const [name, input] of Object.entries(candidate.inputs ?? {})) {
    const previous = current.inputs?.[name];
    if (!Object.hasOwn(values, name) && previous && Object.hasOwn(previous, 'default')
        && previous.default !== input.default) {
      additions[name] = previous.default;
    }
    if (input.required === true && !Object.hasOwn(input, 'default')
        && !Object.hasOwn(values, name) && !Object.hasOwn(additions, name)) {
      warnings.push(`New required input ${name} needs a value.`);
    }
  }
  if (current.runs?.using !== candidate.runs?.using) {
    warnings.push(`Action runtime changes from ${current.runs?.using} to ${candidate.runs?.using}; verify runner compatibility.`);
  }
  return { additions, warnings };
}

export function replaceReference(source, reference, sha, tag, additions = {}) {
  if (!/^[a-f0-9]{40}$/.test(sha) || !parseReleaseTag(tag)) throw new Error('Invalid replacement pin');
  const { step, uses, action } = reference;
  if (!Object.keys(additions).length) {
    const lineEnd = source.indexOf('\n', uses.range[1]);
    return { start: uses.range[0], end: lineEnd < 0 ? source.length : lineEnd, text: `${action}@${sha} # ${tag}` };
  }
  const replacement = parseActionDocument(YAML.stringify(step.toJSON(), { lineWidth: 0 }));
  replacement.set('uses', `${action}@${sha}`);
  replacement.get('uses', true).comment = ` ${tag}`;
  replacement.set('with', { ...(step.get('with')?.toJSON() ?? {}), ...additions });
  const indent = step.range[0] - source.lastIndexOf('\n', step.range[0]) - 1;
  const text = replacement.toString({ lineWidth: 0 }).trimEnd().split('\n')
    .map((line, index) => index ? ' '.repeat(indent) + line : line).join('\n') + '\n';
  return { start: step.range[0], end: step.range[1], text };
}

export class GitHubClient {
  constructor(token = process.env.GITHUB_TOKEN) {
    this.token = token;
    this.cache = new Map();
  }

  async get(endpoint, optional = false) {
    if (this.cache.has(endpoint)) return this.cache.get(endpoint);
    const url = new URL(`https://api.github.com${endpoint}`);
    if (url.origin !== 'https://api.github.com' || !endpoint.startsWith('/repos/')) throw new Error('Invalid API endpoint');
    const response = await fetch(url, {
      headers: {
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
      },
      redirect: 'error',
      signal: AbortSignal.timeout(15000),
    });
    if (optional && response.status === 404) return undefined;
    if (!response.ok) throw new Error(`GitHub API ${response.status}: ${endpoint}`);
    let size = 0;
    const chunks = [];
    for await (const chunk of response.body) {
      size += chunk.length;
      if (size > 4 * 1024 * 1024) throw new Error('GitHub response exceeds size limit');
      chunks.push(chunk);
    }
    const data = JSON.parse(Buffer.concat(chunks).toString('utf8'));
    this.cache.set(endpoint, data);
    return data;
  }

  async releases(repository) {
    const releases = [];
    for (let page = 1; page <= 100; page++) {
      const batch = await this.get(`/repos/${repository}/releases?per_page=100&page=${page}`);
      if (!Array.isArray(batch)) throw new Error(`Invalid releases for ${repository}`);
      releases.push(...batch);
      if (batch.length < 100) return releases;
    }
    throw new Error(`Release pagination limit exceeded for ${repository}`);
  }

  async resolveTag(repository, tag) {
    if (!parseReleaseTag(tag)) throw new Error(`Invalid release tag: ${tag}`);
    let { object } = await this.get(`/repos/${repository}/git/ref/tags/${encodeURIComponent(tag)}`);
    for (let depth = 0; object?.type === 'tag' && depth < 5; depth++) {
      if (!/^[a-f0-9]{40}$/.test(object.sha)) throw new Error('Invalid tag object');
      ({ object } = await this.get(`/repos/${repository}/git/tags/${object.sha}`));
    }
    if (object?.type !== 'commit' || !/^[a-f0-9]{40}$/.test(object.sha)) throw new Error(`Tag ${tag} does not resolve to a commit`);
    return object.sha;
  }

  async metadata(action, sha) {
    const [owner, repo, ...subpath] = action.split('/');
    for (const filename of ['action.yml', 'action.yaml']) {
      const artifactPath = [...subpath, filename].map(encodeURIComponent).join('/');
      const data = await this.get(`/repos/${owner}/${repo}/contents/${artifactPath}?ref=${sha}`, true);
      if (!data) continue;
      if (data.type !== 'file' || data.encoding !== 'base64' || typeof data.content !== 'string') {
        throw new Error(`Invalid action metadata for ${action}`);
      }
      return parseActionDocument(Buffer.from(data.content, 'base64').toString('utf8')).toJS({ maxAliasCount: 0 });
    }
    throw new Error(`Missing action metadata for ${action}@${sha}`);
  }
}

export async function actionFiles(root, directory = '') {
  const files = [];
  for (const entry of await readdir(path.join(root, directory), { withFileTypes: true })) {
    if (entry.isSymbolicLink()) throw new Error(`Symlink not supported: ${path.join(directory, entry.name)}`);
    if (entry.name.startsWith('.') || ['node_modules', 'dist', 'runner'].includes(entry.name)) continue;
    const relative = path.posix.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await actionFiles(root, relative));
    else if (['action.yml', 'action.yaml'].includes(entry.name)) files.push(relative);
  }
  return files.sort();
}

export async function updatePins(root, manifest, client, { now = Date.now(), write = false } = {}) {
  validateManifest(manifest);
  const updates = [];
  const planned = [];
  const seenOverrides = new Set();
  for (const file of await actionFiles(root)) {
    const filename = path.join(root, file);
    const canonical = await realpath(filename);
    if (!canonical.startsWith(`${await realpath(root)}${path.sep}`)) throw new Error('Action path escapes repository');
    const source = await readFile(filename, 'utf8');
    const edits = [];
    for (const reference of discoverReferences(source, file)) {
      const directory = path.posix.dirname(file);
      const policy = manifest.overrides?.[directory]?.[reference.action] ?? {};
      seenOverrides.add(`${directory}:${reference.action}`);
      const repository = reference.action.split('/').slice(0, 2).join('/');
      const currentSha = await client.resolveTag(repository, reference.tag);
      if (currentSha !== reference.sha) throw new Error(`${file}: release tag ${reference.tag} moved; investigate before updating`);
      const candidate = selectRelease(await client.releases(repository), policy, now, manifest.minimumReleaseAgeDays);
      if (!candidate) continue;
      const oldVersion = parseReleaseTag(reference.tag);
      const newVersion = parseReleaseTag(candidate.tag_name);
      const variantChange = newVersion.variant !== oldVersion.variant;
      if (semver.lt(newVersion.version, oldVersion.version)
          || (semver.eq(newVersion.version, oldVersion.version) && !variantChange)) continue;
      const sha = await client.resolveTag(repository, candidate.tag_name);
      const current = await client.metadata(reference.action, reference.sha);
      const next = await client.metadata(reference.action, sha);
      const { additions, warnings } = planConfiguration(reference.step, current, next);
      if (semver.major(newVersion.version) !== semver.major(oldVersion.version)) {
        warnings.push('Major upgrade: review release notes for behavioral changes beyond action metadata.');
      }
      if (variantChange) warnings.push('Runtime release variant changes; verify runner compatibility.');
      edits.push(replaceReference(source, reference, sha, candidate.tag_name, additions));
      updates.push({ file, action: reference.action, from: reference.tag, to: candidate.tag_name,
        oldSha: reference.sha, sha, published: candidate.published_at, additions, warnings });
    }
    if (edits.length) {
      let updated = source;
      for (const edit of edits.sort((left, right) => right.start - left.start)) {
        updated = updated.slice(0, edit.start) + edit.text + updated.slice(edit.end);
      }
      discoverReferences(updated, file);
      planned.push({ filename, updated });
    }
  }
  for (const [directory, actions] of Object.entries(manifest.overrides ?? {})) {
    for (const action of Object.keys(actions)) {
      if (!seenOverrides.has(`${directory}:${action}`)) throw new Error(`Unused override: ${directory}:${action}`);
    }
  }
  if (write) for (const { filename, updated } of planned) await writeFile(filename, updated);
  return { updates, requiresMigration: updates.some(update => update.warnings.length > 0) };
}

export function reportMarkdown(report, ageDays) {
  const lines = [`Update third-party action pins after a minimum release age of ${ageDays} days.`, '',
    'Review the changes before merging. This updater does not execute upstream code.', ''];
  for (const update of report.updates) {
    const repository = update.action.split('/').slice(0, 2).join('/');
    lines.push(`### ${update.file}: ${update.action}`, '',
      `- ${update.from} (${update.oldSha}) -> ${update.to} (${update.sha})`,
      `- Published: ${update.published}`,
      `- Release: https://github.com/${repository}/releases/tag/${update.to}`,
      `- Diff: https://github.com/${repository}/compare/${update.oldSha}...${update.sha}`);
    for (const [name, value] of Object.entries(update.additions)) {
      lines.push(`- Preserve previous input default: ${name}=${JSON.stringify(value)}`);
    }
    for (const warning of update.warnings) lines.push(`- REVIEW REQUIRED: ${warning}`);
    lines.push('');
  }
  lines.push('PRs created with GITHUB_TOKEN do not normally trigger other workflows. Run validation before merging.');
  return lines.join('\n') + '\n';
}

async function main() {
  const args = process.argv.slice(2);
  if (args.some(arg => !['--write', '--check'].includes(arg))) throw new Error('Usage: node scripts/update-action-pins.mjs [--check | --write]');
  const root = fileURLToPath(new URL('../', import.meta.url));
  const manifest = JSON.parse(await readFile(path.join(root, 'action-updates.json'), 'utf8'));
  const report = await updatePins(root, manifest, new GitHubClient(), { write: args.includes('--write') });
  const markdown = reportMarkdown(report, manifest.minimumReleaseAgeDays);
  console.log(markdown);
  if (process.env.GITHUB_STEP_SUMMARY) await writeFile(process.env.GITHUB_STEP_SUMMARY, markdown, { flag: 'a' });
  if (process.env.GITHUB_OUTPUT) {
    await writeFile(process.env.GITHUB_OUTPUT,
      `has_changes=${report.updates.length > 0}\nrequires_migration=${report.requiresMigration}\n`, { flag: 'a' });
  }
  if (process.env.ACTION_UPDATE_BODY) await writeFile(process.env.ACTION_UPDATE_BODY, markdown);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(error => { console.error(error.message); process.exitCode = 1; });
}