This action allows for setting up the Fortify tools listed below. Which tools and which versions to install, and whether to add the tool bin-directories to the system path, is controlled through action inputs as listed in the next section.

* [fcli](https://github.com/fortify/fcli)
* [Debricked CLI](https://github.com/debricked/cli)
* [ScanCentral Client]({{var:sc-client-doc-base-url}}#cli/intro.htm)
* [FoDUploader](https://github.com/fod-dev/fod-uploader-java)
* [FortifyVulnerabilityExporter](https://github.com/fortify/FortifyVulnerabilityExporter)
* [FortifyBugTrackerUtility](https://github.com/fortify-ps/FortifyBugTrackerUtility)

{{include:action/_generic/prerequisites-h3.md}}

### Sample usage

The sample workflow below demonstrates how to configure the action for installing the various Fortify tools and how to run these tools. Some notes:

* The `export-path` and `bugtracker-utility` inputs are set to their default values, and thus could have been omitted.
* The action supports semantic versioning, so the `vuln-exporter` input will install the latest known v2.x.y version of FortifyVulnerabilityExporter.

```yaml
    steps:    
      - name: Setup Fortify tools
        uses: fortify/github-action/setup@{{var:action-major-version}}
        with:
          tool-definitions: https://github.com/fortify/tool-definitions/releases/download/v1/tool-definitions.yaml.zip
          export-path: true
          fcli: latest
          sc-client: 23.1.0
          fod-uploader: latest
          vuln-exporter: v2
          bugtracker-utility: skip
          debricked-cli: skip
      - name: Run fcli from PATH
        run: fcli -V
      - name: Run fcli using FCLI_CMD environment variable
        run: ${FCLI_CMD} -V
```

{{include:action/_generic/nocomments.input-section-and-table-header.md}}
| export&#8209;path |  Whether to add the installed tools to the system PATH variable. Allowed values: `true` (default) or `false` |
| tool&#8209;definitions | Allows for overriding the location of the Fortify tool definitions bundle. This can be specified either as an action input or through the `TOOL_DEFINITIONS` environment variable; see the 'Action environment variable inputs' section below for details. |
| fcli | The fcli version to install. Allowed values: `skip` (default value, do not install fcli), `latest`, or specific version number. Supports semantic versioning, for example `v2` will install the latest known `2.x.y` version. Version may be specified either with or without the `v` prefix, for example `v2.0.0` and `2.0.0` are semantically the same. |
| sc&#8209;client | The ScanCentral Client version to install. Allowed values: `skip` (default value, do not install), `latest`, or specific version number. Supports semantic versioning, for example `23.1` will install the latest known `23.1.y` patch version. Version may be specified either with or without the `v` prefix, for example `v23.1` and `23.1` are semantically the same. |
| fod&#8209;uploader | The FoDUploader version to install. Allowed values: `skip` (default value, do not install), `latest`, or specific version number. Supports semantic versioning, for example `v5` will install the latest known `5.x.y` version. Version may be specified either with or without the `v` prefix, for example `v5.4.0` and `5.4.0` are semantically the same. |
| vuln&#8209;exporter | The FortifyVulnerabilityExporter version to install. Allowed values: `skip` (default value, do not install), `latest`, or specific version number. Supports semantic versioning, for example `v2` will install the latest known `2.x.y` version. Version may be specified either with or without the `v` prefix, for example `v2.0.4` and `2.0.4` are semantically the same. |
| bugtracker&#8209;utility | The FortifyBugTrackerUtility version to install. Allowed values: `skip` (default value, do not install), `latest`, or specific version number. Supports semantic versioning, for example `v4` will install the latest known `4.x` version. Version may be specified either with or without the `v` prefix, for example `v4.12` and `4.12` are semantically the same. |
| debricked&#8209;cli | The Debricked CLI version to install. Allowed values: `skip` (default value, do not install), `latest`, or specific version number. Supports semantic versioning, for example `v1` will install the latest known `1.x` version. Version may be specified either with or without the `v` prefix, for example `v1` and `1` are semantically the same. |

{{include:action/_generic/nocomments.env-section-and-table-header.md}}
{{include:action/setup/nocomments.env-tool-definitions.md}}

### Action outputs

For each tool being installed, the action outputs several environment variables for use by later workflow steps.

{{include:action/_generic/nocomments.env-table-header.md}}
| PATH | If the `export-path` action input was set to `true` (default), the bin-directory of the installed tool will be added to the workflow `PATH` environment variable. |
| &lt;TOOL_NAME&gt;_INSTALL_DIR | Directory where the corresponding tool was installed. `<TOOL_NAME>` corresponds to the various action inputs, but converted to uppercase and dashes replaced by underscore, for example `FOD_UPLOADER_INSTALL_DIR`. |
| &lt;TOOL_NAME&gt;_BIN_DIR | Bin-directory that holds the executables for the corresponding tool. `<TOOL_NAME>` corresponds to the various action inputs, but converted to uppercase and dashes replaced by underscore, for example `FOD_UPLOADER_BIN_DIR`. |
| &lt;TOOL_NAME&gt;_CMD | Fully qualified path to the (primary) executable/script for the corresponding tool. `<TOOL_NAME>` corresponds to the various action inputs, but converted to uppercase and dashes replaced by underscore, for example `FOD_UPLOADER_CMD`. |
