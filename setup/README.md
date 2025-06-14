# fortify/github-action/setup@v2 


<!-- START-INCLUDE:p.marketing-intro.md -->

[Fortify Application Security](https://www.microfocus.com/en-us/solutions/application-security) provides your team with solutions to empower [DevSecOps](https://www.microfocus.com/en-us/cyberres/use-cases/devsecops) practices, enable [cloud transformation](https://www.microfocus.com/en-us/cyberres/use-cases/cloud-transformation), and secure your [software supply chain](https://www.microfocus.com/en-us/cyberres/use-cases/securing-the-software-supply-chain). As the sole Code Security solution with over two decades of expertise and acknowledged as a market leader by all major analysts, Fortify delivers the most adaptable, precise, and scalable AppSec platform available, supporting the breadth of tech you use and integrated into your preferred toolchain. We firmly believe that your great code [demands great security](https://www.microfocus.com/cyberres/application-security/developer-security), and with Fortify, go beyond 'check the box' security to achieve that.

<!-- END-INCLUDE:p.marketing-intro.md -->



<!-- START-INCLUDE:action/setup/readme.md -->

This action allows for setting up the Fortify tools listed below. Which tools and which versions to install, and whether to add the tool bin-directories to the system path, is controlled through action inputs as listed in the next section.

* [fcli](https://github.com/fortify/fcli)
* [Debricked CLI](https://github.com/debricked/cli)
* [ScanCentral Client](https://www.microfocus.com/documentation/fortify-software-security-center/2520/sc-sast-ugd-html-25.2.0/index.htm#cli/intro.htm)
* [FoDUploader](https://github.com/fod-dev/fod-uploader-java)
* [FortifyVulnerabilityExporter](https://github.com/fortify/FortifyVulnerabilityExporter)
* [FortifyBugTrackerUtility](https://github.com/fortify-ps/FortifyBugTrackerUtility)


<!-- START-INCLUDE:action/_generic/prerequisites-h3.md -->

### Prerequisites


<!-- START-INCLUDE:action/_generic/prerequisites.md -->

This action assumes the standard software packages as provided by GitHub-hosted runners to be available. If you are using self-hosted runners, you may need to install some of these software packages in order to successfully use this action. In particular, not having the following software installed is known to cause issues when running `fortify/github-action` or one of its sub-actions:

* Node.js
* Visual C++ Redistributable (Windows-based runners only)
* Bash shell   
  If using Windows runners, this must be a Windows-based `bash` variant, for example as provided by MSYS2. You must make sure that this Windows-based `bash` variant is used for `run` steps that specify `shell: bash`. Actions will fail if the GitHub runner executes `bash` commands on the WSL-provided `bash.exe`

<!-- END-INCLUDE:action/_generic/prerequisites.md -->


<!-- END-INCLUDE:action/_generic/prerequisites-h3.md -->


### Sample usage

The sample workflow below demonstrates how to configure the action for installing the various Fortify tools and how to run these tools. Some notes:

* The `export-path` and `bugtracker-utility` inputs are set to their default values, and thus could have been omitted.
* The action supports semantic versioning, so the `vuln-exporter` input will install the latest known v2.x.y version of FortifyVulnerabilityExporter.

```yaml
    steps:    
      - name: Setup Fortify tools
        uses: fortify/github-action/setup@v2
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

### Action inputs

This section lists the inputs that can be specified in the `with:` clause for this GitHub Action. Any inputs marked in **bold** are required.

| Action input | Description |
| :--- | :--- |
| export&#8209;path |  Whether to add the installed tools to the system PATH variable. Allowed values: `true` (default) or `false` |
| tool&#8209;definitions | Allows for overriding the location of the Fortify tool definitions bundle. This can be specified either as an action input or through the `TOOL_DEFINITIONS` environment variable; see the 'Action environment variable inputs' section below for details. |
| fcli | The fcli version to install. Allowed values: `skip` (default value, do not install fcli), `latest`, or specific version number. Supports semantic versioning, for example `v2` will install the latest known `2.x.y` version. Version may be specified either with or without the `v` prefix, for example `v2.0.0` and `2.0.0` are semantically the same. |
| sc&#8209;client | The ScanCentral Client version to install. Allowed values: `skip` (default value, do not install), `latest`, or specific version number. Supports semantic versioning, for example `23.1` will install the latest known `23.1.y` patch version. Version may be specified either with or without the `v` prefix, for example `v23.1` and `23.1` are semantically the same. |
| fod&#8209;uploader | The FoDUploader version to install. Allowed values: `skip` (default value, do not install), `latest`, or specific version number. Supports semantic versioning, for example `v5` will install the latest known `5.x.y` version. Version may be specified either with or without the `v` prefix, for example `v5.4.0` and `5.4.0` are semantically the same. |
| vuln&#8209;exporter | The FortifyVulnerabilityExporter version to install. Allowed values: `skip` (default value, do not install), `latest`, or specific version number. Supports semantic versioning, for example `v2` will install the latest known `2.x.y` version. Version may be specified either with or without the `v` prefix, for example `v2.0.4` and `2.0.4` are semantically the same. |
| bugtracker&#8209;utility | The FortifyBugTrackerUtility version to install. Allowed values: `skip` (default value, do not install), `latest`, or specific version number. Supports semantic versioning, for example `v4` will install the latest known `4.x` version. Version may be specified either with or without the `v` prefix, for example `v4.12` and `4.12` are semantically the same. |
| debricked&#8209;cli | The Debricked CLI version to install. Allowed values: `skip` (default value, do not install), `latest`, or specific version number. Supports semantic versioning, for example `v1` will install the latest known `1.x` version. Version may be specified either with or without the `v` prefix, for example `v1` and `1` are semantically the same. |

### Action environment variable inputs

This section lists the environment variables that can be specified in the `env:` clause for this GitHub Action. Any environment variables marked in **bold** are required.

| Environment variable | Description |
| :--- | :--- |
| TOOL_DEFINITIONS | Fortify tool definitions are used by this GitHub Action to determine available versions, download location and other details of various Fortify-related tools, as required for action execution. By default, the Fortify-provided tool definitions hosted at https://github.com/fortify/tool-definitions/releases/tag/v1 will be used.<br/><br/>This environment variable allows for overriding the default tool definitions, pointing to either a URL or local (workspace) file. For example, if GitHub workflows are not allowed to download tools from their public internet locations, customers may host the tool installation bundles on an internal server, together with a customized tool definitions bundle that lists the alternative download URLs. |

### Action outputs

For each tool being installed, the action outputs several environment variables for use by later workflow steps.

| Environment variable | Description |
| :--- | :--- |
| PATH | If the `export-path` action input was set to `true` (default), the bin-directory of the installed tool will be added to the workflow `PATH` environment variable. |
| &lt;TOOL_NAME&gt;_INSTALL_DIR | Directory where the corresponding tool was installed. `<TOOL_NAME>` corresponds to the various action inputs, but converted to uppercase and dashes replaced by underscore, for example `FOD_UPLOADER_INSTALL_DIR`. |
| &lt;TOOL_NAME&gt;_BIN_DIR | Bin-directory that holds the executables for the corresponding tool. `<TOOL_NAME>` corresponds to the various action inputs, but converted to uppercase and dashes replaced by underscore, for example `FOD_UPLOADER_BIN_DIR`. |
| &lt;TOOL_NAME&gt;_CMD | Fully qualified path to the (primary) executable/script for the corresponding tool. `<TOOL_NAME>` corresponds to the various action inputs, but converted to uppercase and dashes replaced by underscore, for example `FOD_UPLOADER_CMD`. |

<!-- END-INCLUDE:action/setup/readme.md -->



<!-- START-INCLUDE:h2.support.md -->

## Support

For general assistance, please join the [Fortify Community](https://community.opentext.com/cybersec/fortify/) to get tips and tricks from other users and the OpenText team.
 
OpenText customers can contact our world-class [support team](https://www.opentext.com/support/opentext-enterprise/) for questions, enhancement requests and bug reports. You can also raise questions and issues through your OpenText Fortify representative like Customer Success Manager or Technical Account Manager if applicable.

You may also consider raising questions or issues through the [GitHub Issues page](https://github.com/fortify/github-action/issues) (if available for this repository), providing public visibility and allowing anyone (including all contributors) to review and comment on your question or issue. Note that this requires a GitHub account, and given public visibility, you should refrain from posting any confidential data through this channel. 

<!-- END-INCLUDE:h2.support.md -->


---

*[This document was auto-generated; do not edit by hand](https://github.com/fortify/shared-doc-resources/blob/main/USAGE.md)*
