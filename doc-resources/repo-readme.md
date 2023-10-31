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
  Install various Fortify tools like [fcli](https://github.com/fortify/fcli), [ScanCentral Client]({{var:sc-client-doc-base-url}}#A_Clients.htm), [FortifyVulnerabilityExporter](https://github.com/fortify/FortifyVulnerabilityExporter) and [FortifyBugTrackerUtility](https://github.com/fortify-ps/FortifyBugTrackerUtility) for use in your pipeline
  
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
  Install various Fortify tools like [fcli](https://github.com/fortify/fcli), [ScanCentral Client]({{var:sc-client-doc-base-url}}#A_Clients.htm), [FortifyVulnerabilityExporter](https://github.com/fortify/FortifyVulnerabilityExporter) and [FortifyBugTrackerUtility](https://github.com/fortify-ps/FortifyBugTrackerUtility) for use in your pipeline

## Primary action

The primary `fortify/github-action@{{var:action-major-version}}` currently allows for running SAST scans on either Fortify on Demand or ScanCentral SAST; future versions may add support for other activities like running DAST scans. Which activities to perform is controlled through action inputs, the input for those activities is provided through environment variables.

### Action inputs

**`sast-scan`**    
If not specified or when set to false, no SAST scan will be performed. When set to true, the action will run a SAST scan on either Fortify on Demand (if the FOD_URL environment variable has been specified), or on ScanCentral SAST (if the SSC_URL environment variable has been specified). This includes packaging the source code, running the scan, and optionally reporting scan results back into GitHub. 

### Action environment variable inputs

#### Fortify on Demand

{{include:env-fod-sast-scan.md}}

#### ScanCentral SAST

{{include:env-sc-sast-scan.md}}

### Sample workflows

The sample workflows below demonstrate how to configure the action for running a SAST scan on either Fortify on Demand or ScanCentral SAST.

#### Fortify on Demand

```yaml
    steps:    
      - name: Check out source code
        uses: actions/checkout@v4  
      - name: Run FoD SAST Scan
        uses: fortify/github-action@{{var:action-major-version}}
        with:
          sast-scan: true
        env:
{{include:nocomments.env-fod-sast-scan-sample.md}}
```

#### ScanCentral SAST

```yaml
    steps:    
      - name: Check out source code
        uses: actions/checkout@v4  
      - name: Run ScanCentral SAST Scan
        uses: fortify/github-action@{{var:action-major-version}}
        with:
          sast-scan: true
        env:
{{include:nocomments.env-sc-sast-scan-sample.md}}
```

### More information

Depending on input, this action delegates to the appropriate sub-action(s). Please refer to the documentation of these actions for a more detailed description of action behavior & requirements:

* FoD SAST & optional Open-Source Scan: [`fortify/github-action/fod-sast-scan@{{var:action-major-version}}`](#fod-sast-scan-action)
* ScanCentral SAST Scan: [`fortify/github-action/sc-sast-scan@{{var:action-major-version}}`](#sc-sast-scan-action)


## setup action

{{include:action-setup.md}}

## package action

{{include:action-package.md}}

## fod-sast-scan action

{{include:action-fod-sast-scan.md}}

## fod-export action

{{include:action-fod-export.md}}

## sc-sast-scan action

{{include:action-sc-sast-scan.md}}

## ssc-export action

{{include:action-ssc-export.md}}
