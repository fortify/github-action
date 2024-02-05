This action performs a SAST scan on ScanCentral SAST, consisting of the following steps:

* Login to ScanCentral SAST Controller
* Package application source code using ScanCentral Client
* Submit the source code package to be scanned to ScanCentral SAST Controller
* Optionally wait for the scan to complete
* Optionally export scan results to the GitHub Code Scanning dashboard

Before running this action, please ensure that the appropriate application version has been created on SSC. Future versions of this action may add support for automating application version creation.

### Action environment variable inputs

{{include:env-sc-sast-scan.md}}

{{include:env-setup.md}}

### Sample usage

The sample workflow below demonstrates how to configure the action for running a SAST scan on ScanCentral SAST.

```yaml
    steps:    
      - name: Check out source code
        uses: actions/checkout@v4  
      - name: Run ScanCentral SAST Scan
        uses: fortify/github-action/sc-sast-scan@{{var:action-major-version}}
        env:
{{include:nocomments.env-sc-sast-scan-sample.md}}
{{include:nocomments.env-setup-sample.md}}
```