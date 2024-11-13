This action performs a SAST scan on ScanCentral SAST, consisting of the following steps:

* Login to ScanCentral SAST Controller
* Package application source code using ScanCentral Client
* Submit the source code package to be scanned to ScanCentral SAST Controller
* Optionally run a Debricked Software Composition Analysis scan
* Optionally wait for all scans to complete and results having been processed by SSC
* Optionally export scan results to the GitHub Code Scanning dashboard

{{include:action/_generic/prerequisites-h3.md}}

Apart from the generic action prerequisites listed above, the following prerequisites apply to this specific action:

* If Debricked scanning is enabled, the [Fortify SSC Parser Plugin for Debricked results](https://github.com/fortify/fortify-ssc-parser-debricked-cyclonedx) must be installed on Fortify SSC, to allow for SSC to accept and process the Debricked scan results submitted by this action.

### Sample usage

The sample workflow below demonstrates how to configure the action for running a SAST scan on ScanCentral SAST.

```yaml
    steps:    
      - name: Check out source code
        uses: actions/checkout@v4  
      - name: Run ScanCentral SAST Scan
        uses: fortify/github-action/sc-sast-scan@{{var:action-major-version}}
        env:
{{include:action/_generic/sc-sast/nocomments.snippet-ssc-and-sc-sast-login.md}}
{{include:action/_generic/debricked/nocomments.snippet-debricked-token.md}}
{{include:action/_generic/ssc/nocomments.snippet-ssc-appversion.md}}
{{include:action/_generic/nocomments.snippet-setup.md}}
{{include:action/package/nocomments.snippet-sc-client-version.md}}
{{include:action/package/nocomments.snippet-package-extra-opts.md}}
{{include:action/sc-sast-scan/nocomments.snippet-sc-sast-scan.md}}
          # DO_DEBRICKED_SCAN: true
{{include:action/_generic/nocomments.snippet-do-wait.md}}
{{include:action/_generic/nocomments.snippet-policy-check.md}}
{{include:action/_generic/nocomments.snippet-job-summary.md}}
{{include:action/_generic/nocomments.snippet-pr-comment.md}}
{{include:action/_generic/nocomments.snippet-export-optional.md}}
{{include:action/setup/nocomments.snippet-tool-definitions.md}}
```

{{include:action/_generic/nocomments.env-section-and-table-header.md}}
{{include:action/_generic/sc-sast/nocomments.env-ssc-and-sc-sast-login.md}}
{{include:action/_generic/debricked/nocomments.env-debricked-token.md}}
{{include:action/_generic/ssc/nocomments.env-ssc-appversion.md}}
{{include:action/sc-sast-scan/nocomments.env-setup.md}}
|DO_DEBRICKED_SCAN|If set to `true`, this GitHub Action will also run a Debricked Software Composition Analysis scan and publish the results to SSC. Note that this requires the [Fortify SSC Parser Plugin for Debricked results](https://github.com/fortify/fortify-ssc-parser-debricked-cyclonedx) to be installed on Fortify SSC, to allow for SSC to accept and process the Debricked scan results submitted by this action.|
{{include:action/package/nocomments.env-sc-client-version.md}}
{{include:action/package/nocomments.env-package-extra-opts.md}}
{{include:action/sc-sast-scan/nocomments.env-sc-sast-scan.md}}
{{include:action/_generic/nocomments.env-do-wait.md}}
{{include:action/sc-sast-scan/nocomments.env-policy-check.md}}
{{include:action/sc-sast-scan/nocomments.env-job-summary.md}}
{{include:action/ssc-export/nocomments.env-export-optional.md}}
{{include:action/sc-sast-scan/nocomments.env-pr-comment.md}}
{{include:action/setup/nocomments.env-tool-definitions.md}}

{{include:action/_generic/ssc/ssc-fcli-actions.md}}

{{include:action/_generic/ssc/ssc-pr.md}}