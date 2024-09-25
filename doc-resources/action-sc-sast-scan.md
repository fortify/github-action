This action performs a SAST scan on ScanCentral SAST, consisting of the following steps:

* Login to ScanCentral SAST Controller
* Package application source code using ScanCentral Client
* Submit the source code package to be scanned to ScanCentral SAST Controller
* Optionally run a Debricked Software Composition Analysis scan
* Optionally wait for all scans to complete and results having been processed by SSC
* Optionally export scan results to the GitHub Code Scanning dashboard

{{include:action-prerequisites.md}}

Apart from the generic action prerequisites listed above, the following prerequisites apply to this specific action:

* The appropriate application version must exist on SSC. Future versions of this action may add support for automating application version creation.
* If Debricked scanning is enabled, the [Fortify SSC Parser Plugin for Debricked results](https://github.com/fortify/fortify-ssc-parser-debricked-cyclonedx) must be installed on Fortify SSC, to allow for SSC to accept and process the Debricked scan results submitted by this action.

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