## Information for Developers

### Repository initialization
After cloning this repository, please run `./configure.sh` to install npm modules and configure git hooks.

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

### Building the action

The action uses the `@fortify/setup` NPM package published to [npmjs.org](https://www.npmjs.com/package/@fortify/setup). To build:

```bash
cd setup
npm install
npm run build
```

This creates a bundled `dist/index.js` file that includes all dependencies. The action is ready to use once the dist directory is committed.

### Third-party action pins

Customer-facing actions reference third-party actions directly by full commit
SHA, with an exact release tag in the adjacent comment. Repository workflows use
the shared-github wrappers instead. Internal Fortify action references remain
managed by `update-action-refs.sh` and are excluded from the third-party updater.

The `Update third-party action pins` workflow runs daily and can be dispatched
manually on the default branch. `action-updates.json` sets a seven-day minimum
release age. Releases are filtered by age before selecting the newest eligible
version, so a newer release does not block an older eligible upgrade. Drafts,
prereleases, missing timestamps, and moving major tags are excluded. Existing
pins are never downgraded, and moved release tags fail validation.

Directory-specific overrides constrain GHES upload-artifact to major 3. Other
third-party references can follow new stable majors. Optional runtime tag
variants must be explicitly selected. Unknown or unused overrides fail validation.

The updater preserves changed input defaults with explicit values and raises
draft PRs for major/runtime changes or unresolved input migrations. Review release
notes before merging. Inspection runs read-only; a separate publishing job only
accepts changes to existing action metadata, without file-mode changes.

PR creation requires the repository setting allowing GitHub Actions to create
pull requests. PRs created with `GITHUB_TOKEN` do not normally trigger other
workflows, so run validation manually before merging.

```bash
npm ci --prefix scripts --ignore-scripts
npm test --prefix scripts
node scripts/update-action-pins.mjs --check
```

Use `--write` instead of `--check` to apply eligible updates locally. Offline
tests do not call GitHub or Fortify services. An optional `GITHUB_TOKEN` can
authenticate read-only release inspection to avoid anonymous API limits.
