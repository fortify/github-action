This action performs a SAST scan on Fortify on Demand (FoD). If software composition analysis of open source has been purchased and configured on the applicable release, this action can be used to perform a combined SAST and SCA (open source) scan. 

The SAST and optional open source scan performed by this action consists of the following steps:

* Login to FoD
* Package application source code using ScanCentral Client
* Submit the source code package to be scanned to FoD
* Optionally wait for the scan to complete
* Optionally export scan results to the GitHub Code Scanning dashboard

{{include:action/generic/prerequisites-h3.md}}

### Sample usage

The sample workflow below demonstrates how to configure the action for running a SAST scan on FoD.

```yaml
    steps:    
      - name: Check out source code
        uses: actions/checkout@v4  
      - name: Run FoD SAST Scan
        uses: fortify/github-action/fod-sast-scan@{{var:action-major-version}}
        env:
{{include:action/generic/fod/nocomments.snippet-fod-login.md}}
{{include:action/generic/fod/nocomments.snippet-fod-release.md}}
{{include:action/generic/nocomments.snippet-setup.md}}
{{include:action/package/nocomments.snippet-package-extra-opts.md}}
{{include:action/fod-sast-scan/nocomments.snippet-fod-sast-scan.md}}
          # DO_DEBRICKED_SCAN: true
{{include:action/generic/nocomments.snippet-policy-check.md}}
{{include:action/generic/nocomments.snippet-policy-check.md}}
{{include:action/generic/nocomments.snippet-job-summary.md}}
{{include:action/generic/nocomments.snippet-pr-comment.md}}
{{include:action/generic/nocomments.snippet-export-optional.md}}
{{include:action/setup/nocomments.snippet-tool-definitions.md}}
```


{{include:action/generic/nocomments.env-section-and-table-header.md}}
{{include:action/generic/fod/nocomments.env-fod-login.md}}
{{include:action/generic/fod/nocomments.env-fod-release.md}}
{{include:action/fod-sast-scan/nocomments.env-setup.md}}
{{include:action/package/nocomments.env-package-extra-opts.md}}
{{include:action/fod-sast-scan/nocomments.env-fod-sast-scan.md}}
|DO_DEBRICKED_SCAN|Configure the static scan to also run an open-source scan. Depending on FoD configuration, this may be either a Debricked or a Sonatype scan. Effectively, this adds dependency data to the scan payload, and enables the open-source scan setting in the FoD scan configuration. Note that any existing FoD scan configuration will not be updated, so if the scan has already been configured in FoD, an open-source scan will only be performed if previously enabled in the existing scan configuration.|
{{include:action/generic/nocomments.env-do-wait.md}}
{{include:action/fod-sast-scan/nocomments.env-policy-check.md}}
{{include:action/fod-sast-scan/nocomments.env-job-summary.md}}
{{include:action/fod-export/nocomments.env-export-optional.md}}
{{include:action/fod-sast-scan/nocomments.env-pr-comment.md}}
{{include:action/setup/nocomments.env-tool-definitions.md}}

{{include:action/generic/fod/fod-fcli-actions.md}}

{{include:action/generic/fod/fod-pr.md}}
