## Information for Developers

### Repository initialization
After cloning this repository, the recommended setup is `./configure.sh --hooks`: install locked tooling dependencies, build the shared runtime, generate actions, run offline tests, and enable validation hooks. Plain `./configure.sh` performs initialization without enabling hooks. To enable hooks later, run `node .github/tooling/git-hooks.mjs --install`. Installation uses local `core.hooksPath` and refuses to replace existing hook configuration or disable custom/legacy hooks. Review existing hooks first; initialization reports obsolete commands without overwriting them.

### Optional validation hooks

The version-controlled hooks live in `.github/tooling/hooks`. Pre-commit checks
generated action YAML and the maintained contributor-guide include against the staged source, not unstaged working-tree edits.
Pre-push checks each pushed tip's committed YAML and runtime bundle, typechecks,
and runs offline tests. Deletions are skipped; annotated tags are resolved to
their commits. Checks use temporary raw Git snapshots without checkout filters,
so partial staging and Windows line-ending conversion do not alter validation.
Installed dependencies must match the snapshot lockfile; hooks never install them.

Hooks never generate files in the working tree or stage changes. A stale output
blocks the operation and prints explicit regeneration commands. Run these commands,
review the changes, and stage only intended source/output changes:

```bash
npm run generate --prefix .github/tooling
npm run build --prefix .github/tooling
```

Runtime uses the same explicit generation and validation process as YAML, with
its more expensive check deferred to pre-push. CI remains authoritative because
hooks are optional and can be bypassed. Disable repository hooks with
`git config --local --unset core.hooksPath` if that setting still points to
`.github/tooling/hooks`; custom hooks can instead invoke the Node checker directly.

Documentation should also be generated explicitly, reviewed, and staged. Hooks
check the local `repo-devinfo.md` include in the contributor guide, preserving the
surrounding agreement and footer. Other docs get an advisory reminder, not a hard
freshness check. Hooks never run the network-dependent full doc generator: its
shared script/templates track a moving branch and include time-dependent values.
Pinning and caching those inputs is a prerequisite for a complete offline gate.

### Documentation structure
Documentation is generated from the `doc-resources` directory using functionality provided by https://github.com/fortify/shared-doc-resources. The structure is straightforward:

* `repo-intro.md`: Introduction text included in README.md
* `repo-usage.md`: Usage instructions included in USAGE.md
* `repo-resources.md`: Links to resources (contributing, license, etc.)
* `repo-devinfo.md`: Information for developers (this file)
* `repo-usage-text.md`: Include file with links to detailed documentation (used in both intro and usage)
* `template-values.md`: Variables used throughout the documentation
* `update-repo-docs.sh`: Script to regenerate README.md, USAGE.md, and other files

To update documentation, edit the appropriate `.md` files in `doc-resources/`, then run `doc-resources/update-repo-docs.sh` to regenerate the top-level documentation files.

For changes only to this developer guide, use the offline contributor renderer:

```bash
npm run docs:contributing --prefix .github/tooling
npm run docs:check --prefix .github/tooling
```

It refreshes only the `repo-devinfo.md` include in `CONTRIBUTING.md`; outside
content stays unchanged. It does not refresh shared headers/templates or other
documents. For changes to other fragments, shared templates, or include/variable
directives, explicitly run `bash doc-resources/update-repo-docs.sh` and review all
affected generated files. Do not hand-edit generated top-level documentation.

### Source and generated implementation

`.github/action-src/actions.yml` owns all composite definitions, reusable YAML
anchors, exact third-party SHA pins, and updater policies. `without-artifacts`
is the source parent; artifact variants add an upload step, and the root action
is a direct alias of the GitHub variant. Output anchors match their action directory
names. Generated action files are committed and must not
be edited directly. The generator resolves shallow YAML merges, expands one
level of step groups, and strips `x-update-policy` and `x-repository-paths` metadata.
The latter maps step environment variables to repository-relative files; the
generator computes the correct path from each action directory automatically.
Root and GitHub-variant actions therefore share the same definition and behavior,
with only their generated bundle path differing. Output files come entirely from
the source YAML's `outputs` keys, including newly declared nested action paths.
Only safe `action.yml`/`action.yaml` paths are accepted; traversal, infrastructure
paths, and symlinked output paths are rejected. It does not query
GitHub, install runtime packages, or interpolate branch names.

Each composite invokes a pinned `actions/github-script` step that loads the
committed `runtime/setup.cjs` from its own downloaded repository. This one step
sets the Fortify data directory, bootstraps fcli, imports freshly exported tool
environment variables, runs the CI action, and sets outputs even on failure.
Artifact variants add their pinned upload action with an `always()` condition.
There are no internal action calls and no checkout of the caller's repository
is needed to load the runtime. The runtime does not alter the caller's Node
version or add fcli to PATH.

`.github/tooling/setup.ts` is the shared TypeScript source. It bundles the
`@fortify/setup` NPM package and its dependencies into one CommonJS file. The
standalone `/setup` Node 24 action is retained as an input adapter over the same
bundle. Composites currently use github-script v7's private Node 20 runtime;
runner/GHES installations must support that runtime, and `/setup` additionally
requires Node 24 action support. GHES must have access to the pinned external
actions through its configured action availability/synchronization mechanism.

### Building and testing

```bash
npm ci --prefix .github/tooling --ignore-scripts
npm run build --prefix .github/tooling
npm run generate --prefix .github/tooling
npm run check --prefix .github/tooling
npm run typecheck --prefix .github/tooling
npm test --prefix .github/tooling
```

### Feature development workflow

Run these commands from the repository root. Work on a feature branch such as
`feat-1`; branch names never enter generated action references. Initialize once,
then refresh dependencies with `npm ci --prefix .github/tooling --ignore-scripts`
when a branch switch or dependency edit changes the lockfile.

| Use case | When and where | Action |
| --- | --- | --- |
| Change composite steps, inputs, outputs, metadata, or variants | Locally after editing `.github/action-src/actions.yml`, before staging | Run `npm run generate --prefix .github/tooling`. Review and stage the source plus every changed generated action. New output paths belong in the YAML, not a second script list. |
| Change runtime behavior | Locally after editing `.github/tooling/setup.ts`, before staging | Run `npm run build --prefix .github/tooling`. Review and stage runtime source, `runtime/setup.cjs`, and any changed license output. `/setup` metadata/adapter remain hand-maintained. |
| Change generators, bundler config, or dependency versions | Locally before committing | Refresh locked dependencies if needed, regenerate affected YAML/runtime output, and run checks, typecheck, and tests. Commit manifest/lockfile changes with affected source/output. |
| Change contributor instructions | Locally before staging | Edit `doc-resources/repo-devinfo.md`, run `npm run docs:contributing --prefix .github/tooling`, then review and stage the fragment and guide. |
| Change other documentation | Locally before committing | Edit source fragments, explicitly run the full doc generator, and review/stage affected output. Do not rely on a later automatic refresh for a feature commit. |
| Commit a feature | Locally after reviewing/staging | Pre-commit checks the index's YAML and contributor include. Partial staging is respected. Hooks never regenerate or run `git add`; fix stale output explicitly and stage it yourself. |
| Push a feature | Locally after committing | Pre-push checks each pushed tip's committed output, runtime, types, and tests. Unstaged changes cannot repair an incomplete commit; amend or add a follow-up commit with the missing output. |
| Feature push or pull request | Automatically in GitHub | `Validate actions` verifies committed output and runs Linux/Windows, Node 20/24 tests. Publish workflow also validates pushes. Neither generates missing files nor pushes fixes to your branch. |
| Test the actual action | In a caller workflow after pushing a complete feature commit | Use `fortify/github-action@feat-1`, or a variant at the same ref. Supply authorized test configuration/credentials through secrets. Test GitHub/GHES compatibility and failure/debug behavior explicitly; offline tests do not run scans. |
| Update third-party pins | Scheduled/manual workflow on the default branch, or explicit local updater invocation | Updater changes source pins, regenerates declared actions, validates, and opens one PR. New GitHub majors/runtime changes need draft review; GHES upload stays on v3. |
| Review a bot PR | Before merging, in GitHub and a caller workflow when compatibility changes | Dispatch `Validate actions` with the PR branch/SHA in `ref`, because `GITHUB_TOKEN` PRs do not normally trigger other workflows. Read release notes and run live compatibility checks before accepting major/runtime changes. |
| Merge/release | Automatically on `main` after passing validation | Release tooling publishes validated commits/tags without branch-aware regeneration. The docs workflow refreshes docs on `main` pushes, schedule, or manual dispatch; it is separate from feature action generation. |

Before committing or pushing substantial changes, run the local verification set:

```bash
npm run check --prefix .github/tooling
npm run typecheck --prefix .github/tooling
npm test --prefix .github/tooling
```

`check` only verifies existing YAML, runtime, and contributor include; it never
repairs output. Regenerate only the affected artifacts, inspect the diff, and
stage source/output together. Avoid broad `git add .` when unrelated or partially
staged work is present. Re-run generation after resolving source merge conflicts;
do not resolve generated output independently of its source.

After pushing, wait for validation before depending on the branch in callers.
If CI reports stale output, regenerate locally and push another complete commit;
there is no automatic post-push rewrite. Production callers should pin the tested
commit SHA rather than the moving feature branch. Keep scan credentials out of
commits and treat debug artifacts as sensitive.
Pinning the action does not freeze downloaded Fortify tools; configure their
versions separately according to your CI policy.

Commit source changes, generated YAML, and the rebuilt runtime/license bundle
together. CI checks deterministic regeneration and exercises offline tests on
Linux/Windows with Node 20/24. Tests cover setup inputs, same-step environment
handoff, subprocess failures, debug outputs, alias expansion, and pin migrations.
They do not call Fortify services. Tests of the actual composite actions against
GitHub/GHES and live scanning remain integration checks in a caller workflow.

Feature branches are immediately usable with `fortify/github-action@feat-1`,
`fortify/github-action/with-ghes-artifacts@feat-1`, or another variant at that
same ref. There is no post-push rewrite. Use `Validate actions` workflow's
manual dispatch and `ref` input to validate bot PR branches, since PRs created
with `GITHUB_TOKEN` do not normally trigger additional workflows. Release
validation checks committed outputs rather than regenerating or pushing files.

### Third-party action pins

All customer-facing external action references use a full SHA and adjacent
exact release comment. Repository workflows retain pinned shared-github wrappers.
The daily/manual `Update third-party action pins` workflow updates canonical
source pins and includes regenerated actions in the same PR. The publishing job
derives its allowed paths from the trusted base source: the source YAML plus its
declared generated actions. It rejects additions, deletions, mode changes, and
unrelated files using staged patch inspection, then verifies regenerated output
before creating the PR. No second list of generated output paths is maintained.

The source YAML's `updates.minimumReleaseAgeDays` defaults in this repository to
seven days. Age filtering precedes release selection. Drafts, prereleases,
missing timestamps, and moving major tags are excluded; pins never downgrade,
and moved release tags fail closed. The `ghes-upload` policy fixes its usage to
major 3. GitHub upload and github-script have no major ceiling: eligible new
majors produce draft PRs for manual review. Runtime changes, release-variant
changes, and unresolved input migrations also require draft review. The updater
preserves changed input defaults with explicit values. Unknown/unused policies
are rejected. Generation does not automatically approve or install candidates.

```bash
node .github/tooling/update-action-pins.mjs --check
node .github/tooling/update-action-pins.mjs --write
```

Inspection is read-only unless `--write` is selected; writes reject stale
generated output. The updater inspects upstream metadata without executing it.
An optional `GITHUB_TOKEN` authenticates read-only release inspection. Creating
PRs requires the repository setting allowing GitHub Actions to create PRs.
Normal `contents: write` permissions suffice for source YAML under `.github`;
workflow-file updates remain separate and need appropriately authorized credentials.
