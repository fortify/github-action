The [Fortify github-action repository]({{var:repo-url}}) hosts various Fortify-related GitHub Actions as listed in the sections below. 

**Fortify on Demand**

* [`fortify/github-action`](#fortify-github-action)  
  For now, this action provides the same functionality as the `fod-sast-scan` action listed below. Future versions may add support for running other types of scans or performing other FoD operations.
* [`fortify/github-action/fod-sast-scan`](#fortify-github-action-fod-sast-scan)  
  Package source code, submit static application security testing (SAST) scan request to Fortify on Demand, optionally wait for completion and export results back to the GitHub Security dashboard.
* [`fortify/github-action/package`](#fortify-github-action-package)  
  Package source code for running a SAST scan, using the latest version of ScanCentral Client. Optionally resolve dependencies for Software Composition Analysis (SCA) of open source components with integrated Debricked analysis via Fortify on Demand.
* [`fortify/github-action/fod-export`](#fortify-github-action-fod-export)  
  Export SAST vulnerability data from Fortify on Demand to the GitHub Security dashboard.
* [`fortify/github-action/setup`](#fortify-github-action-setup)  
  Install various Fortify tools like [fcli](https://github.com/fortify/fcli), [ScanCentral Client]({{var:sc-client-doc-base-url}}#A_Clients.htm), [FortifyVulnerabilityExporter](https://github.com/fortify/FortifyVulnerabilityExporter) and [FortifyBugTrackerUtility](https://github.com/fortify-ps/FortifyBugTrackerUtility) for use in your pipeline
  
**Fortify Sofware Security Center (SSC) / ScanCentral SAST / Debricked**

* [`fortify/github-action`](#fortify-github-action)  
  Depending on inputs, this action will run either or both a ScanCentral SAST and Debricked Software Composition Analysis (SCA) scan and publish scan results to SSC. Future versions may add support for running other types of scans or performing other SSC / ScanCentral operations.
* [`fortify/github-action/sc-sast-scan`](#fortify-github-action-sc-sast-scan)  
  Run a ScanCentral SAST and optionally Debricked Software Composition Analysis scan by packaging source code, submitting ScanCentral SAST scan and optional Debricked scan request, and optionally waiting for completion and exporting SAST results back to the GitHub Security dashboard.
* [`fortify/github-action/ssc-debricked-scan`](#fortify-github-action-ssc-debricked-scan)  
  Run a Debricked Software Composition Analysis scan and publish scan results to SSC, optionally waiting for scan results to be fully processed on SSC.
* [`fortify/github-action/package`](#fortify-github-action-package)  
  Package source code for running a SAST scan, using the latest version of ScanCentral Client.
* [`fortify/github-action/ssc-export`](#fortify-github-action-ssc-export)  
  Export SAST vulnerability data from Fortify SSC to the GitHub Security dashboard.
* [`fortify/github-action/setup`](#fortify-github-action-setup)  
  Install various Fortify tools like [fcli](https://github.com/fortify/fcli), [ScanCentral Client]({{var:sc-client-doc-base-url}}#A_Clients.htm), [FortifyVulnerabilityExporter](https://github.com/fortify/FortifyVulnerabilityExporter) and [FortifyBugTrackerUtility](https://github.com/fortify-ps/FortifyBugTrackerUtility) for use in your pipeline

<a name="fortify-github-action"></a>

## fortify/github-action

The primary `fortify/github-action` action currently allows for running SAST and optional Software Composition Analysis scans on either Fortify on Demand or ScanCentral SAST / Debricked.  Which activities to perform is controlled through action inputs, the input for those activities is provided through environment variables.

Based on inputs and environment variables, this action will simply configure and run one of the following sub-actions:

| Conditions | Sub-action |
| ---------- | ---------- |
| `sast-scan: true`<br>`FOD_URL` specified | [`fortify/github-action/fod-sast-scan`](#fortify-github-action-fod-sast-scan) |
| `sast-scan: true`<br>`SSC_URL` specified | [`fortify/github-action/sc-sast-scan`](#fortify-github-action-sc-sast-scan) |
| `sast-scan: false`<br>`debricked-sca-scan: true`<br>`SSC_URL` specified | [`fortify/github-action/ssc-debricked-scan`](#fortify-github-action-ssc-debricked-scan) |

If none of the conditions listed above are met, this action will complete without performing any work.

{{include:action-prerequisites.md}}

Depending on inputs, additional prerequisites may apply as listed in the documentation for the sub-actions listed in the table above.

### Action inputs

**`sast-scan`** - OPTIONAL    
When set to true, the action will run a SAST scan on either Fortify on Demand (if the `FOD_URL` environment variable has been specified), or on ScanCentral SAST (if the `SSC_URL` environment variable has been specified). This includes packaging the source code, running the scan, and optionally reporting SAST scan results back into GitHub. 

If not specified or when set to false, no SAST scan will be performed. For FoD, this means that the action will complete without doing any work. For SSC, the action could still run a Debricked-only scan based on the `debricked-sca-scan` input as listed below. Future versions of this action may provide additional inputs, for example allowing you to run a dynamic application security testing (DAST) scan instead of (or in combination with) a SAST scan.

**`debricked-sca-scan`** - OPTIONAL    
(Not applicable to Fortify on Demand) When set to true, the action will run a Debricked Software Composition Analysis (SCA) scan and publish the results to Fortify SSC. You can either run a Debricked-only scan (`sast-scan` set to `false`), or both SAST and Debricked SCA scan if both inputs are set to `true`.

### Action environment variable inputs

#### Fortify on Demand

{{include:env-fod-sast-scan.md}}

{{include:env-setup.md}}

#### ScanCentral SAST with optional Debricked scan

{{include:env-sc-sast-scan.md}}

{{include:env-setup.md}}

#### Debricked-only scan and publish to SSC

{{include:env-ssc-debricked-scan.md}}

{{include:env-setup.md}}

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
{{include:nocomments.env-setup-sample.md}}
```

#### ScanCentral SAST with optional Debricked scan

```yaml
    steps:    
      - name: Check out source code
        uses: actions/checkout@v4  
      - name: Run ScanCentral SAST Scan
        uses: fortify/github-action@{{var:action-major-version}}
        with:
          sast-scan: true
          # debricked-sca-scan: true
        env:
{{include:nocomments.env-sc-sast-scan-sample.md}}
{{include:nocomments.env-setup-sample.md}}
```

#### Debricked-only scan and publish to SSC

```yaml
    steps:    
      - name: Check out source code
        uses: actions/checkout@v4  
      - name: Run Debricked Scan
        uses: fortify/github-action@{{var:action-major-version}}
        with:
          sast-scan: false
          debricked-sca-scan: true
        env:
{{include:nocomments.env-ssc-debricked-scan-sample.md}}
{{include:nocomments.env-setup-sample.md}}
```

### More information

Depending on input, this action delegates to the appropriate sub-action(s). Please refer to the documentation of these actions for a more detailed description of action behavior & requirements:

* FoD SAST & optional SCA (open source) scan: [`fortify/github-action/fod-sast-scan`](#fortify-github-action-fod-sast-scan)
* ScanCentral SAST scan: [`fortify/github-action/sc-sast-scan`](#fortify-github-action-sc-sast-scan)


<a name="fortify-github-action-setup"></a>

## fortify/github-action/setup

{{include:action-setup.md}}


<a name="fortify-github-action-package"></a>

## fortify/github-action/package

{{include:action-package.md}}


<a name="fortify-github-action-fod-sast-scan"></a>

## fortify/github-action/fod-sast-scan

{{include:action-fod-sast-scan.md}}


<a name="fortify-github-action-fod-export"></a>

## fortify/github-action/fod-export

{{include:action-fod-export.md}}


<a name="fortify-github-action-sc-sast-scan"></a>

## fortify/github-action/sc-sast-scan

{{include:action-sc-sast-scan.md}}


<a name="fortify-github-action-ssc-debricked-scan"></a>

## fortify/github-action/ssc-debricked-scan

{{include:action-ssc-debricked-scan.md}}


<a name="fortify-github-action-ssc-export"></a>

## fortify/github-action/ssc-export

{{include:action-ssc-export.md}}
