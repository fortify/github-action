import semver from 'semver';
import { readFile, writeFile, realpath } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import YAML from 'yaml';
import { execFileSync } from 'node:child_process';
import { parseSource, generateActions, generateRepository, sourceFile } from './generate-actions.mjs';

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
  if (Object.keys(manifest).some(key => !['minimumReleaseAgeDays', 'policies'].includes(key))) {
    throw new Error('Unknown manifest setting');
  }
  if (manifest.policies !== undefined && (!manifest.policies || Array.isArray(manifest.policies)
      || typeof manifest.policies !== 'object')) throw new Error('Invalid update policies');
  for (const [name, policy] of Object.entries(manifest.policies ?? {})) {
    if (!/^[a-z][a-z0-9-]*$/.test(name)) throw new Error(`Invalid policy name: ${name}`);
    if (!policy || typeof policy !== 'object' || Array.isArray(policy)
        || Object.keys(policy).some(key => !['allowedMajors', 'tagVariant'].includes(key))) throw new Error(`Unknown policy setting for ${name}`);
    if (policy.allowedMajors !== undefined && (!Array.isArray(policy.allowedMajors) || !policy.allowedMajors.length
        || policy.allowedMajors.some(major => !Number.isInteger(major) || major < 1))) throw new Error(`Invalid allowedMajors for ${name}`);
    if (policy.tagVariant !== undefined && !/^(-node\d+)?$/.test(policy.tagVariant)) throw new Error(`Invalid tagVariant for ${name}`);
  }
  return manifest;
}

export function parseActionDocument(source) {
  const document = YAML.parseDocument(source, { uniqueKeys: true });
  if (document.errors.length) throw new Error(document.errors.map(error => error.message).join('\n'));
  document.toJS({ maxAliasCount: 0, mapAsMap: false });
  return document;
}

export function discoverReferences(source, file) {
  const { document, value } = parseSource(source);
  const manifest = validateManifest(value.updates);
  generateActions(source);
  const references = [];
  const seenPolicies = new Set();
  function visit(step, resolved) {
    if (YAML.isMap(step)) {
      const uses = step.get('uses', true);
      if (uses) {
        if (!YAML.isScalar(uses) || typeof uses.value !== 'string') throw new Error(`${file}: invalid uses`);
        const match = /^([\w-]+\/[\w.-]+(?:\/[\w.-]+)*)@([a-f0-9]{40})$/.exec(uses.value);
        if (!match || match[1].split('/').some(segment => ['.', '..'].includes(segment))
            || /^fortify\/github-action(?:\/|$)/.test(match[1])) throw new Error(`${file}: external reference must use a full SHA; internal actions are forbidden`);
        const tag = uses.comment?.trim();
        if (!tag || !parseReleaseTag(tag)) throw new Error(`${file}: ${match[1]} needs an exact release comment`);
        const policyName = step.get('x-update-policy');
        if (policyName !== undefined && (typeof policyName !== 'string' || !Object.hasOwn(manifest.policies ?? {}, policyName))) throw new Error(`Unknown update policy: ${policyName}`);
        const policy = manifest.policies?.[policyName] ?? {};
        if (policy.allowedMajors && !policy.allowedMajors.includes(semver.major(parseReleaseTag(tag).version))) throw new Error(`${file}: current release violates policy ${policyName}`);
        if (policyName) seenPolicies.add(policyName);
        references.push({ file, step, uses, action: match[1], sha: match[2], tag, policy, values: resolved });
      }
      for (const pair of step.items) visit(pair.value, resolved?.[pair.key.value]);
    } else if (YAML.isSeq(step)) {
      step.items.forEach((item, index) => visit(item, resolved?.[index]));
    }
  }
  visit(document.contents, value);
  for (const name of Object.keys(manifest.policies ?? {})) {
    if (!seenPolicies.has(name)) throw new Error(`Unused update policy: ${name}`);
  }
  return { references, document, manifest };
}

export function planConfiguration(step, current, candidate) {
  const values = step.with ?? {};
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

export async function updatePins(root, client, { now = Date.now(), write = false } = {}) {
  const filename = path.join(root, sourceFile);
  if (await realpath(filename) !== path.join(await realpath(root), sourceFile)) throw new Error('Source path contains a symlink');
  const source = await readFile(filename, 'utf8');
  const { references, document, manifest } = discoverReferences(source, sourceFile);
  const updates = [];
  for (const reference of references) {
    const repository = reference.action.split('/').slice(0, 2).join('/');
    const currentSha = await client.resolveTag(repository, reference.tag);
    if (currentSha !== reference.sha) throw new Error(`${sourceFile}: release tag ${reference.tag} moved; investigate before updating`);
    const candidate = selectRelease(await client.releases(repository), reference.policy, now, manifest.minimumReleaseAgeDays);
    if (!candidate) continue;
    const oldVersion = parseReleaseTag(reference.tag);
    const newVersion = parseReleaseTag(candidate.tag_name);
    const variantChange = newVersion.variant !== oldVersion.variant;
    if (semver.lt(newVersion.version, oldVersion.version)
        || (semver.eq(newVersion.version, oldVersion.version) && !variantChange)) continue;
    const sha = await client.resolveTag(repository, candidate.tag_name);
    const current = await client.metadata(reference.action, reference.sha);
    const next = await client.metadata(reference.action, sha);
    const { additions, warnings } = planConfiguration(reference.values, current, next);
    if (semver.major(newVersion.version) !== semver.major(oldVersion.version)) {
      warnings.push('Major upgrade: review release notes for behavioral changes beyond action metadata.');
    }
    if (variantChange) warnings.push('Runtime release variant changes; verify runner compatibility.');
    reference.uses.value = `${reference.action}@${sha}`;
    reference.uses.comment = ` ${candidate.tag_name}`;
    if (Object.keys(additions).length) reference.step.set('with', { ...(reference.values.with ?? {}), ...additions });
    updates.push({ file: sourceFile, action: reference.action, from: reference.tag, to: candidate.tag_name,
      oldSha: reference.sha, sha, published: candidate.published_at, additions, warnings });
  }
  if (updates.length) {
    const updated = document.toString({ lineWidth: 0 });
    discoverReferences(updated, sourceFile);
    if (write) {
      await generateRepository(root, { check: true });
      await writeFile(filename, updated);
      await generateRepository(root);
    }
  }
  return { updates, requiresMigration: updates.some(update => update.warnings.length > 0), ageDays: manifest.minimumReleaseAgeDays };
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

export async function exportUpdatePatch(root, filename) {
  const outputs = generateActions(await readFile(path.join(root, sourceFile), 'utf8'));
  const patch = execFileSync('git', ['diff', '--binary', '--', sourceFile, ...outputs.keys()], { cwd: root });
  await writeFile(filename, patch);
}

export async function applyUpdatePatch(root, filename) {
  const outputs = generateActions(await readFile(path.join(root, sourceFile), 'utf8'));
  const allowed = new Set([sourceFile, ...outputs.keys()]);
  execFileSync('git', ['apply', '--index', '--check', filename], { cwd: root });
  execFileSync('git', ['apply', '--index', filename], { cwd: root });
  const changes = execFileSync('git', ['diff', '--cached', '--raw', '-z'], { cwd: root, encoding: 'utf8' }).split('\0');
  for (let index = 0; index < changes.length - 1; index += 2) {
    if (!/^:100644 100644 [a-f0-9]+ [a-f0-9]+ M$/.test(changes[index]) || !allowed.has(changes[index + 1])) {
      throw new Error('Update patch must only modify trusted source and existing declared action metadata, without mode changes');
    }
  }
  execFileSync('git', ['diff', '--cached', '--check'], { cwd: root });
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length > 1 || args.some(arg => !['--write', '--check', '--export-patch', '--apply-patch'].includes(arg))) throw new Error('Usage: update-action-pins.mjs [--check | --write | --export-patch | --apply-patch]');
  const root = fileURLToPath(new URL('../../', import.meta.url));
  if (args[0] === '--export-patch' || args[0] === '--apply-patch') {
    if (!process.env.ACTION_UPDATE_PATCH) throw new Error('ACTION_UPDATE_PATCH must be set');
    if (args[0] === '--export-patch') await exportUpdatePatch(root, process.env.ACTION_UPDATE_PATCH);
    else await applyUpdatePatch(root, process.env.ACTION_UPDATE_PATCH);
    return;
  }
  const report = await updatePins(root, new GitHubClient(), { write: args.includes('--write') });
  const markdown = reportMarkdown(report, report.ageDays);
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