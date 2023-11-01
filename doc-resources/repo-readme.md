The [Fortify github-action repository]({{repo-url}}) hosts various Fortify-related GitHub Actions as listed in the sections below.

**Fortify on Demand**

* [`fortify/github-action@{{var:action-major-version}}`](#primary-action)  
  For now, this action provides the same functionality as the `fod-sast-scan` action listed below. Future versions may add support for running other types of scans or performing other FoD actions.
* [`fortify/github-action/fod-sast-scan@{{var:action-major-version}}`](#fod-sast-scan-action)  
  Package source code, submit static application security testing (SAST) scan request to Fortify on Demand, optionally wait for completion and export results back to the GitHub Security dashboard.
* [`fortify/github-action/package@{{var:action-major-version}}`](#package-action)  
  Package source code for running a SAST scan, using the latest version of ScanCentral Client. Optionally resolve dependencies for Software Composition Analysis (SCA) of open source components with integrated Debricked analysis via Fortify on Demand.
* [`fortify/github-action/fod-export@{{var:action-major-version}}`](#fod-export-action)  
  Export SAST vulnerability data from Fortify on Demand to the GitHub Security dashboard.
* [`fortify/github-action/setup@{{var:action-major-version}}`](#setup-action)  
  Install various Fortify tools like [fcli](https://github.com/fortify/fcli), [ScanCentral Client]({{var:sc-client-doc-base-url}}#A_Clients.htm), [FortifyVulnerabilityExporter](https://github.com/fortify/FortifyVulnerabilityExporter) and [FortifyBugTrackerUtility](https://github.com/fortify-ps/FortifyBugTrackerUtility) for use in your pipeline
  
**Fortify Sofware Security Center (SSC) / ScanCentral SAST**

* [`fortify/github-action@{{var:action-major-version}}`](#primary-action)  
  For now, this action provides the same functionality as the `ssc-sast-scan` action listed below. Future versions may add support for running other types of scans or performing other SSC / ScanCentral actions.
* [`fortify/github-action/sc-sast-scan@{{var:action-major-version}}`](#sc-sast-scan-action)  
  Package source code, submit SAST scan request to ScanCentral SAST, optionally wait for completion and export results back to the GitHub Security dashboard.
* [`fortify/github-action/package@{{var:action-major-version}}`](#package-action)  
  Package source code for running a SAST scan, using the latest version of ScanCentral Client.
* [`fortify/github-action/ssc-export@{{var:action-major-version}}`](#ssc-export-action)  
  Export SAST vulnerability data from Fortify SSC to the GitHub Security dashboard.
* [`fortify/github-action/setup@{{var:action-major-version}}`](#setup-action)  
  Install various Fortify tools like [fcli](https://github.com/fortify/fcli), [ScanCentral Client]({{var:sc-client-doc-base-url}}#A_Clients.htm), [FortifyVulnerabilityExporter](https://github.com/fortify/FortifyVulnerabilityExporter) and [FortifyBugTrackerUtility](https://github.com/fortify-ps/FortifyBugTrackerUtility) for use in your pipeline

## Primary action

The primary `fortify/github-action@{{var:action-major-version}}` currently allows for running SAST scans on either Fortify on Demand or ScanCentral SAST.  Which activities to perform is controlled through action inputs, the input for those activities is provided through environment variables.  Software composition analysis of open source components may also be performed in conjunction with the Fortify on Demand SAST scan for customers who have purchased the functionality.

### Action inputs

**`sast-scan`** - OPTIONAL    
When set to true, the action will run a SAST scan on either Fortify on Demand (if the FOD_URL environment variable has been specified), or on ScanCentral SAST (if the SSC_URL environment variable has been specified). This includes packaging the source code, running the scan, and optionally reporting SAST scan results back into GitHub. 

If not specified or when set to false, no SAST scan will be performed. For now, this means that the action will complete without doing any work. Future versions of this action may provide additional inputs, for example allowing you to run a dynamic application security testing (DAST) scan instead of a SAST scan.

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

* FoD SAST & optional SCA (open source) Scan: [`fortify/github-action/fod-sast-scan@{{var:action-major-version}}`](#fod-sast-scan-action)
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
