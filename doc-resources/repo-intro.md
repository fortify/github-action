The [Fortify github-action repository]({{repo-url}}) hosts various Fortify-related GitHub Actions as listed in the sections below.

**Fortify on Demand**

* [`fortify/github-action@{{var:action-major-version}}`](#primary-action)  
  For now, this action provides the same functionality as the `fod-sast-scan` action listed below. Future versions may add support for running other types of scans or performing other FoD actions.
* [`fortify/github-action/fod-sast-scan@{{var:action-major-version}}`](#fod-sast-scan-action)  
  Package source code, submit SAST scan request to Fortify on Demand, optionally wait for completion and export results back to the GitHub Security dashboard.
* [`fortify/github-action/package@{{var:action-major-version}}`](#package-action)  
  Package source code for running a SAST scan, using the latest version of ScanCentral Client.
* [`fortify/github-action/fod-export@{{var:action-major-version}}`](#fod-export-action)  
  Export vulnerability data from Fortify on Demand to the GitHub Security dashboard.
* [`fortify/github-action/setup@{{var:action-major-version}}`](#setup-action)  
  Install various Fortify tools like [fcli](https://github.com/fortify/fcli), [ScanCentral Client](https://www.microfocus.com/documentation/fortify-software-security-center/2310/SC_SAST_Help_23.1.0/index.htm#A_Clients.htm), [FortifyVulnerabilityExporter](https://github.com/fortify/FortifyVulnerabilityExporter) and [FortifyBugTrackerUtility](https://github.com/fortify-ps/FortifyBugTrackerUtility) for use in your pipeline
  
**SSC / ScanCentral SAST/ ScanCentral DAST**

* [`fortify/github-action@{{var:action-major-version}}`](#primary-action)  
  For now, this action provides the same functionality as the `ssc-sast-scan` action listed below. Future versions may add support for running other types of scans or performing other SSC / ScanCentral actions.
* [`fortify/github-action/sc-sast-scan@{{var:action-major-version}}`](#sc-sast-scan-action)  
  Package source code, submit SAST scan request to ScanCentral SAST, optionally wait for completion and export results back to the GitHub Security dashboard.
* [`fortify/github-action/package@{{var:action-major-version}}`](#package-action)  
  Package source code for running a SAST scan, using the latest version of ScanCentral Client.
* [`fortify/github-action/ssc-export@{{var:action-major-version}}`](#ssc-export-action)  
  Export vulnerability data from Fortify Software Security Center (SSC) to the GitHub Security dashboard.
* [`fortify/github-action/setup@{{var:action-major-version}}`](#setup-action)  
  Install various Fortify tools like [fcli](https://github.com/fortify/fcli), [ScanCentral Client](https://www.microfocus.com/documentation/fortify-software-security-center/2310/SC_SAST_Help_23.1.0/index.htm#A_Clients.htm), [FortifyVulnerabilityExporter](https://github.com/fortify/FortifyVulnerabilityExporter) and [FortifyBugTrackerUtility](https://github.com/fortify-ps/FortifyBugTrackerUtility) for use in your pipeline

## Primary action

The primary `fortify/github-action@{{var:action-major-version}}` currently allows for running SAST scans on either Fortify on Demand or ScanCentral SAST; future versions may add support for other activities like running DAST scans. Which activities to perform is controlled through action inputs, the input for those activities is provided through environment variables.

### Action inputs

**`sast-scan`**    
If not specified or when set to false, no SAST scan will be performed. When set to true, the action will run a SAST scan on either Fortify on Demand (if the FOD_URL environment variable has been specified), or on ScanCentral SAST (if the SSC_URL environment variable has been specified). This includes packaging the source code, running the scan, and optionally reporting scan results back into GitHub. 

To successfully perform the SAST scan, additional environment variables will need to be configured on the action as listed in these sections:

* Fortify on Demand: [`fortify/github-action/fod-sast-scan@{{var:action-major-version}}`](#fod-sast-scan-action)
* ScanCentral SAST: [`fortify/github-action/sc-sast-scan@{{var:action-major-version}}`](#sc-sast-scan-action)

### Sample workflows

TODO

## setup action

This action allows for setting up the Fortify tools listed below. Which tools and which versions to install, and whether to add the tool bin-directories to the system path, is controlled through action inputs as listed in the next section.

* [fcli](https://github.com/fortify/fcli)
* [ScanCentral Client](https://www.microfocus.com/documentation/fortify-software-security-center/2310/SC_SAST_Help_23.1.0/index.htm#A_Clients.htm)
* [FoDUploader](https://github.com/fod-dev/fod-uploader-java)
* [FortifyVulnerabilityExporter](https://github.com/fortify/FortifyVulnerabilityExporter)
* [FortifyBugTrackerUtility](https://github.com/fortify-ps/FortifyBugTrackerUtility)

### Action inputs

**`export-path`**    
Whether to add the installed tools to the system PATH variable. Allowed values: `true` (default) or `false`

**`fcli`**    
The fcli version to install. Allowed values: `skip` (default value, do not install fcli), `latest`, or specific version number. Supports semantic versioning, for example `v2` will install the latest known `2.x.y` version. Version may be specified either with or without the `v` prefix, for example `v2.0.0` and `2.0.0` are semantically the same.

**`sc-client`**    
The ScanCentral Client version to install. Allowed values: `skip` (default value, do not install), `latest`, or specific version number. Supports semantic versioning, for example `23.1` will install the latest known `23.1.y` patch version. Version may be specified either with or without the `v` prefix, for example `v23.1` and `23.1` are semantically the same.

**`fod-uploader`**    
The FoDUploader version to install. Allowed values: `skip` (default value, do not install), `latest`, or specific version number. Supports semantic versioning, for example `v5` will install the latest known `5.x.y` version. Version may be specified either with or without the `v` prefix, for example `v5.4.0` and `5.4.0` are semantically the same.

**`vuln-exporter`**    
The FortifyVulnerabilityExporter version to install. Allowed values: `skip` (default value, do not install), `latest`, or specific version number. Supports semantic versioning, for example `v2` will install the latest known `2.x.y` version. Version may be specified either with or without the `v` prefix, for example `v2.0.4` and `2.0.4` are semantically the same.

**`bugtracker-utility`**    
The FortifyBugTrackerUtility version to install. Allowed values: skip (default value, do not install), latest, or specific version number. Supports semantic versioning, for example `v4` will install the latest known `4.x` version. Version may be specified either with or without the `v` prefix, for example `v4.12` and `4.12` are semantically the same.

### Action outputs

For each tool being installed, the action outputs several environment variables for use by later workflow steps.

**`PATH`**    
If the `export-path` action input was set to `true` (default), the bin-directory of the installed tool will be added to the workflow `PATH` environment variable.

**`<TOOL_NAME>_INSTALL_DIR`**
Directory where the corresponding tool was installed. `<TOOL_NAME>` corresponds to the various action inputs, but converted to uppercase and dashes replaced by underscore, for example `FOD_UPLOADER_INSTALL_DIR`.

**`<TOOL_NAME>_BIN_DIR`**
Bin-directory that holds the executables for the corresponding tool. `<TOOL_NAME>` corresponds to the various action inputs, but converted to uppercase and dashes replaced by underscore, for example `FOD_UPLOADER_BIN_DIR`.

**`<TOOL_NAME>_CMD`**
Fully qualified path to the (primary) executable/script for the corresponding tool. `<TOOL_NAME>` corresponds to the various action inputs, but converted to uppercase and dashes replaced by underscore, for example `FOD_UPLOADER_CMD`.

### Sample usage

The sample workflow below demonstrates how to configure the action for installing the various Fortify tools and how to run these tools. Some notes:

* The `export-path` and `bugtracker-utility` inputs are set to their default values, and thus could have been omitted.
* The action supports semantic versioning, so the `vuln-exporter` input will install the latest known v2.x.y version of FortifyVulnerabilityExporter.

```yaml
    steps:    
      - name: Setup Fortify tools
        uses: fortify/github-action/setup@{{var:action-major-version}}
        with:
          export-path: true
          fcli: latest
          sc-client: 23.1.0
          fod-uploader: latest
          vuln-exporter: v2
          bugtracker-utility: skip
      - name: Run fcli from PATH
        run: fcli -V
      - name: Run fcli using FCLI_CMD environment variable
        run: ${FCLI_CMD} -V
```

## package action

This action packages source code to be scanned on Fortify on Demand or ScanCentral SAST.

TODO

### Action environment variable inputs

TODO

## fod-sast-scan action

TODO

### Action environment variable inputs

TODO

## fod-export action

TODO

### Action environment variable inputs

TODO

## sc-sast-scan action

TODO

### Action environment variable inputs

TODO

## ssc-export action

TODO

### Action environment variable inputs

TODO
