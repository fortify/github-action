This action performs a SAST scan (optionally combined with an open-source scan) on Fortify on Demand, consisting of the following steps:

* Login to FoD
* Package application source code using ScanCentral Client
* Submit the source code package to be scanned to FoD
* Optionally wait for the scan to complete
* Optionally export scan results to the GitHub Code Scanning dashboard

Before running this action, please ensure that the appropriate release has been created on FoD and has been configured for SAST scans. Future versions of this action may add support for automating app/release creation and scan setup. If Open Source scanning has been enabled in the FoD SAST scan configuration, you'll need to pass the `-oss` option through the `EXTRA_PACKAGE_OPTS` environment variable.

### Action environment variable inputs

{{include:env-fod-sast-scan.md}}
