# Contributing to Fortify GitHub Action

## Contribution Agreement

Contributions like bug fixes and enhancements may be submitted through Pull Requests on this repository. Before we can accept 3<sup>rd</sup>-party pull requests, you will first need to sign and submit the [Contribution Agreement](https://github.com/fortify/repo-resources/raw/main/static/Open%20Source%20Contribution%20Agreement%20Jan2020v1.pdf). Please make sure to mention your GitHub username when submitting the form, to allow us to verify that the author of a pull request has accepted this agreement. 


<!-- START-INCLUDE:repo-devinfo.md -->

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

<!-- END-INCLUDE:repo-devinfo.md -->


---

*[This document was auto-generated from CONTRIBUTING.template.md; do not edit by hand](https://github.com/fortify/shared-doc-resources/blob/main/USAGE.md)*
