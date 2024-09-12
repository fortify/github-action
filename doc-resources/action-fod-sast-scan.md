This action performs a SAST scan on Fortify on Demand (FoD). If software composition analysis of open source has been purchased and configured on the applicable release, this action can be used to perform a combined SAST and SCA (open source) scan. 

The SAST and optional open source scan performed by this action consists of the following steps:

* Login to FoD
* Package application source code using ScanCentral Client
* Submit the source code package to be scanned to FoD
* Optionally wait for the scan to complete
* Optionally export scan results to the GitHub Code Scanning dashboard

{{include:action-prerequisites.md}}

Apart from the generic action prerequisites listed above, the following prerequisites apply to this specific action:

* The appropriate application release exists on FoD and has been configured for SAST scans. Future versions of this action may add support for automating app/release creation and scan setup.
* If open source scanning has been enabled in the FoD SAST scan configuration, be sure to pass the `-oss` option through the `PACKAGE_EXTRA_OPTS` environment variable.

### Action environment variable inputs

{{include:env-fod-sast-scan.md}}

{{include:env-setup.md}}

### Sample usage

The sample workflow below demonstrates how to configure the action for running a SAST scan on FoD.

```yaml
    steps:    
      - name: Check out source code
        uses: actions/checkout@v4  
      - name: Run FoD SAST Scan
        uses: fortify/github-action/fod-sast-scan@{{var:action-major-version}}
        env:
{{include:nocomments.env-fod-sast-scan-sample.md}}
{{include:nocomments.env-setup-sample.md}}
```
