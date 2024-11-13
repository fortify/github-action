## Information for Developers

### Repository initialization
After cloning this repository, please run ./configure.sh to install npm modules and configure git hooks. When adding a new NodeJS-based action, you'll need to update `<repo-root>/configure.sh` to add the action directory to the for-loop.

### Action documentation
Action documentation is generated from the `doc-resources` directory, using functionality provided by https://github.com/fortify/shared-doc-resources. The `doc-resources` directory contains the following:

* `action/_generic/**/*`: Generic includes referenced from action documentation
* `action/_root/readme.md`: Documentation for the top-level action
* `action/<action-name>`: 
    * `readme.md`: Documentation for `<action-name>` sub-action
    * `nocomments.env-*.md`: Markdown table rows describing environment variable inputs
    * `nocomments.snippet-*.md`: Sample YAML snippets
* `repo-devinfo.md`: Information for developers
* `repo-usage.md`: Used to generated top-level USAGE.md, just refers to README.md
* `template-values.md`: Defines variables used in documentation resources
* `templates/README.template.md`: Template for the top-level `README.md` file
* `templates/<action-name>/README.template.md`: Template for the README.md file for each sub-action
* `update-repo-docs.sh`: Script to generate documentation resources

If you need to update the documentation for an existing action, you'll want to edit the corresponding `action/<action-name>/readme.md` file or the included files. 

When adding a new action, you should:
* Create a corresponding directory in the `doc-resources/templates` directory
* Copy an existing `README.template.md` from one of the other action template directories
* Change the header and include statement in the new `README.template.md` to match the new action
* Create a new `action/<action-name>/readme.md` file in the `doc-resources` directory

After any documentation updates, you may want to manually run `doc-resources/update-repo-docs.sh` to verify whether all includes can be found, and to review the generated README.md files for each action.
