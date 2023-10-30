## Information for Developers

### Repository initialization
After cloning this repository, please run ./configure.sh to install npm modules and configure git hooks. When adding a new NodeJS-based action, you'll need to update `<repo-root>/configure.sh` to add the action directory to the for-loop.

### Action documentation
Action documentation is generated from the `doc-resources` directory, using functionality provided by https://github.com/fortify/shared-doc-resources. The `doc-resources` directory contains the following:

* `templates/README.template.md`: Template for the top-level `README.md` file
* `templates/<action-name>/README.template.md`: Template for the README.md file for each action
* `action-<action-name>.md`: Documentation for each action, included by both the corresponding action readme template, and the top-level readme (through `repo-readme.md`)
* `env-*.md`: Documentation for the environment variables supported by the various actions. Most of these are named after the action that they correspond to, for example `env-fod-login.md` (corresponding to the `internal/fod-login` action), listing action-specific environment variables. Others describe generic environment variables that are shared by multiple actions, for example `env-fod-release.md`.
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
