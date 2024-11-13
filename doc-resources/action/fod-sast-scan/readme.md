This action performs a SAST scan on Fortify on Demand. If software composition analysis of open source has been purchased and configured on the applicable release, this action can be used to perform a combined SAST and SCA (open source) scan. 

The SAST and optional open source scan performed by this action consists of the following steps:

* Login to Fortify on Demand
* Package application source code using ScanCentral Client
* Submit the source code package to be scanned to Fortify on Demand
* Optionally wait for the scan to complete
* Optionally export scan results to the GitHub Code Scanning dashboard

{{include:action/_generic/prerequisites-h3.md}}

### Sample usage

The sample workflow below demonstrates how to configure the action for running a SAST scan on Fortify on Demand.

```yaml
    steps:    
      - name: Check out source code
        uses: actions/checkout@v4  
      - name: Run Fortify on Demand SAST Scan
        uses: fortify/github-action/fod-sast-scan@{{var:action-major-version}}
        env:
{{include:action/_generic/fod/nocomments.snippet-fod-login.md}}
{{include:action/_generic/fod/nocomments.snippet-fod-release.md}}
{{include:action/_generic/nocomments.snippet-setup.md}}
{{include:action/package/nocomments.snippet-sc-client-version.md}}
{{include:action/package/nocomments.snippet-package-extra-opts.md}}
{{include:action/fod-sast-scan/nocomments.snippet-fod-sast-scan.md}}
          # DO_DEBRICKED_SCAN: true
{{include:action/_generic/nocomments.snippet-do-wait.md}}
{{include:action/_generic/nocomments.snippet-policy-check.md}}
{{include:action/_generic/nocomments.snippet-job-summary.md}}
{{include:action/_generic/nocomments.snippet-pr-comment.md}}
{{include:action/_generic/nocomments.snippet-export-optional.md}}
{{include:action/setup/nocomments.snippet-tool-definitions.md}}
```


{{include:action/_generic/nocomments.env-section-and-table-header.md}}
{{include:action/_generic/fod/nocomments.env-fod-login.md}}
{{include:action/_generic/fod/nocomments.env-fod-release.md}}
{{include:action/fod-sast-scan/nocomments.env-setup.md}}
{{include:action/package/nocomments.env-sc-client-version.md}}
{{include:action/package/nocomments.env-package-extra-opts.md}}
{{include:action/fod-sast-scan/nocomments.env-fod-sast-scan.md}}
|DO_DEBRICKED_SCAN|Configure the static scan to also run an open-source scan. Depending on Fortify on Demand configuration, this may be either a Debricked or a Sonatype scan. Effectively, this adds dependency data to the scan payload, and enables the open-source scan setting in the Fortify on Demand scan configuration. Note that any existing scan configuration will not be updated, so if the scan has already been configured in Fortify on Demand, an open-source scan will only be performed if previously enabled in the existing scan configuration.|
{{include:action/_generic/nocomments.env-do-wait.md}}
{{include:action/fod-sast-scan/nocomments.env-policy-check.md}}
{{include:action/fod-sast-scan/nocomments.env-job-summary.md}}
{{include:action/fod-export/nocomments.env-export-optional.md}}
{{include:action/fod-sast-scan/nocomments.env-pr-comment.md}}
{{include:action/setup/nocomments.env-tool-definitions.md}}

{{include:action/_generic/fod/fod-fcli-actions.md}}

{{include:action/_generic/fod/fod-pr.md}}
