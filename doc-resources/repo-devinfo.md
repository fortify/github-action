## Information for Developers

### Repository initialization

Run `./configure.sh` after cloning: it installs locked tooling dependencies,
builds both runtime bundles, and runs freshness checks, typechecking, and offline
tests. Node 24.11 or newer within Node 24 is required for local development.
Refresh dependencies with `npm ci --ignore-scripts` when the lockfile changes.
When migrating an existing checkout, remove the obsolete
`.github/tooling/node_modules` installation first; it can otherwise shadow root
dependencies. Initialization refuses to continue while that directory exists.

Repository-managed Git hooks have been removed; CI is authoritative. If a
previous initialization set `core.hooksPath` to `.github/tooling/hooks`, disable
that obsolete setting with `git config --local --unset core.hooksPath`.
Do not remove custom hook configuration. Legacy hooks calling
`update-action-refs.sh`, `git-hooks.mjs`, or automatically building/staging output
must be reviewed and updated manually.

### Action manifests and runtime source

The root `action.yml` and the manifests in `setup/`, `without-artifacts/`,
`with-github-artifacts/`, and `with-ghes-artifacts/` are maintained directly.
There is no YAML generator or branch-aware reference rewriting.

Keep root and GitHub-variant actions equivalent except for the relative runtime
path. All scan variants use the same scan step; artifact variants add an upload
step with an `always()` condition. Contract tests check these relationships,
SHA-pinned third-party references, runtime paths, inputs, and debug outputs.
Update the tests deliberately when changing these contracts.

Production code lives in `src/`; build and validation scripts and offline tests
live in `.github/tooling/`. The root `package.json`, lockfile, and `tsconfig.json`
provide one dependency installation and TypeScript configuration for both.
Two TypeScript entry points produce two committed CommonJS bundles:

| Source | Bundle | Consumer |
| --- | --- | --- |
| `src/setup.ts` | `runtime/setup.cjs` | Standalone `/setup` Node 24 action |
| `src/run-fcli-ci-action.ts` | `runtime/run-fcli-ci-action.cjs` | All composite scan actions |

Setup owns tool selection, bootstrap caching, and environment export. The scan
module imports its shared `runSetup` function, sets the Fortify data directory,
imports freshly exported environment variables into the current process, and
executes `fcli action run ci`. Debug outputs are set even when setup or scanning
fails. Importing either bundle does not execute standalone setup; the build adds
the direct-execution entry point only to the setup bundle.

The bundles include `@fortify/setup` and its dependencies independently, so
dependency code is duplicated in the generated output, not in the maintained
TypeScript. Each bundle has its own generated `.licenses.txt` file. Callers do
not install runtime npm packages or need a checkout to load these files.
The runtime does not alter the caller's Node version or add fcli to PATH.
Composites use github-script v9's Node 24 runtime; `/setup` also requires Node 24
action support, as it did on `main` and in v3.1.1. GHES must support that runtime
and have access to the pinned external actions through its
synchronization/availability mechanism.

### Why actions are self-contained

The original composites called other actions in this repository through moving
branch or version tags. Pinning the outer action to a SHA did not freeze nested
calls: GitHub resolves every `uses` reference independently.

The flat manifests load local runtime files from the same downloaded commit.
This preserves immutable internal implementation and immediately usable feature
branches without bottom-up historical SHA chains, post-push rewrites, or another
repository to synchronize on GHES. Keep external references SHA-pinned too.
Pinning the action does not freeze downloaded Fortify tools; configure their
versions separately according to your CI policy.

### Building and testing

```bash
npm ci --ignore-scripts
npm run build
npm run check
npm run typecheck
npm test
```

Edit action manifests directly; YAML-only changes require no build. After
changing TypeScript, build configuration, or runtime dependencies, rebuild and
commit both affected bundles and license files with their sources and lockfile.
`check` verifies committed bundles without repairing or staging files.
`.gitattributes` keeps text files LF on all platforms, including Windows
checkouts with `core.autocrlf` enabled, so generated bundle bytes remain stable.
Tests exercise both bundles, setup inputs, same-step
environment handoff, subprocess failures, debug outputs, and action contracts.
They do not download tools or call Fortify services.

The shared validation workflow runs Linux/Windows with Node 24 for feature
pushes, pull requests, and manual dispatch. Publishing on `main` calls that same
workflow and releases only after it succeeds. No workflow rewrites action
manifests or repairs missing bundles.

Push a complete feature commit, wait for validation, and test it in a caller
workflow using `fortify/github-action@your-branch` or a variant at the same ref.
Live scans, failure/debug behavior, and GitHub/GHES compatibility still require
integration testing with authorized configuration and secrets. Production
callers should pin the tested SHA. Keep credentials out of commits and treat
debug artifacts as sensitive.

### Third-party action pins

`.github/renovate.json` enables only the GitHub Actions manager and restricts
updates to `action.yml` manifests. `.github/workflows/*.yml` is explicitly
excluded; those pins continue to use the shared-github update mechanism.
Keep adjacent exact release comments, for example `# v7.0.1`, on full SHA pins.

The daily/manual `Update third-party action pins` workflow runs a pinned
Renovate npm version on Node 24, only on the default branch. It uses the built-in
`GITHUB_TOKEN` with repository contents and pull-request write permissions.
Enable the repository setting allowing GitHub Actions to create pull requests.
No dedicated token secret is needed.

Renovate filters updates until they are at least seven days old and requires
a datasource timestamp; unknown ages do not bypass the cooldown. It groups
action-pin updates and never automerges. The GHES upload action stays on major
3; github-script stays on major 9 to preserve Node 24 compatibility. Change the
corresponding `allowedVersions` rule and compatibility tests deliberately when
adopting a newer major/runtime. GitHub.com upload has no major ceiling, so review
release notes, changed inputs/defaults, and runner requirements before merging.
Renovate does not perform the previous custom input-migration inference.

Digest-only updates are disabled: an existing release tag moving to another
SHA must be investigated, not automatically accepted. New version updates
remain enabled and SHA-pinned. Renovate uses GitHub tag/release timestamp
metadata, not the previous updater's release-only selection algorithm.

PRs created with `GITHUB_TOKEN` do not normally trigger pull-request workflows.
Before merging a Renovate PR, manually dispatch `Validate actions` with the PR
branch or SHA in its `ref` input and inspect all matrix results. The PR body
includes this reminder. Run live compatibility tests when behavior or runtime
requirements change.

### Documentation structure

Documentation fragments live in `doc-resources/` and use functionality from
https://github.com/fortify/shared-doc-resources:

* `repo-intro.md`: Introduction included in README.md
* `repo-usage.md`: Usage instructions included in USAGE.md
* `repo-resources.md`: Links to contributing, license, and other resources
* `repo-devinfo.md`: This developer guide
* `repo-usage-text.md`: Links to detailed documentation
* `template-values.md`: Shared documentation variables
* `update-repo-docs.sh`: Full documentation regeneration

Edit the appropriate fragments, then run the existing full renderer:

```bash
bash doc-resources/update-repo-docs.sh
```

Review and commit the affected generated documents with their fragments.
The existing documentation workflow also regenerates documents on `main`
pushes, on its schedule, and on manual dispatch. There is no separate
contributor-only renderer or local documentation freshness gate.

Filesystem modification dates are not a reliable freshness check: Git checkout
does not preserve source timestamps, and shared templates and time-dependent
variables can change without a local fragment edit. The full renderer uses
network-dependent shared resources, so generation remains an explicit task
rather than an offline validation requirement. Do not hand-edit generated
top-level documentation.
