# Contributing to Fortify GitHub Actions

## Contribution Agreement

Contributions like bug fixes and enhancements may be submitted through Pull Requests on this repository. Before we can accept 3<sup>rd</sup>-party pull requests, you will first need to sign and submit the [Contribution Agreement](https://github.com/fortify/repo-resources/raw/main/static/Open%20Source%20Contribution%20Agreement%20Jan2020v1.pdf). Please make sure to mention your GitHub username when submitting the form, to allow us to verify that the author of a pull request has accepted this agreement. 


<!-- START-INCLUDE:repo-devinfo.md -->

## Information for Developers

### Repository initialization
After cloning this repository, please run ./configure.sh to install npm modules and configure git hooks. When adding a new NodeJS-based action, you'll need to update `<repo-root>/configure.sh` to add the action directory to the for-loop.

### Action documentation
Action documentation is generated from the `doc-resources` directory, using functionality provided by https://github.com/fortify/shared-doc-resources. The `doc-resources` directory contains the following:

* `templates/README.template.md`: Template for the top-level `README.md` file
* `templates/<action-name>/README.template.md`: Template for the README.md file for each action
* `action-<action-name>.md`: Documentation for each action, included by both the corresponding action readme template, and the top-level readme (through `repo-readme.md`)
* `env-*.md`: Documentation for the environment variables supported by the various actions. Most of these are named after the action that they correspond to, for example `env-fod-login.md` (corresponding to the `internal/fod-login` action), listing action-specific environment variables. Others describe generic environment variables that are shared by multiple actions, for example `env-fod-release.md`.
* `nocomments.env-*-sample.md`: Most of the `env-*.md` files mentioned above have a corresponding sample file that shows how to configure the variables in a GitHub workflow.
* `repo-devinfo.md`: Information for developers
* `repo-readme.md`: Top-level readme contents
* `repo-usage.md`: Used to generated top-level USAGE.md, just refers to README.md
* `template-values.md`: Defines variables used in documentation resources
* `update-repo-docs.sh`: Script to generate documentation resources

If you need to update the documentation for an existing action, you'll want to edit the corresponding `action-<action-name>.md` file. 

When adding a new action, you should:
* Create a corresponding directory in the `doc-resources/templates` directory
* Copy an existing `README.template.md` from one of the other action template directories
* Change the header and include statement in the new `README.template.md` to match the new action
* Create a new `action-<action-name>.md` file in the `doc-resources` directory

<!-- END-INCLUDE:repo-devinfo.md -->


---

*[This document was auto-generated from CONTRIBUTING.template.md; do not edit by hand](https://github.com/fortify/shared-doc-resources/blob/main/USAGE.md)*
