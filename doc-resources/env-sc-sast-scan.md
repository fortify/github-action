{{include:env-ssc-connection.md}}

{{include:env-ssc-login.md}}

{{include:env-sc-sast-login.md}}

**`DO_DEBRICKED_SCAN`** - OPTIONAL    
If set to `true`, this action will run both ScanCentral SAST and Debricked Software Composition Analysis (SCA) scans and publish both results to SSC. This is equivalent to setting the `debricked-sca-scan` input on the top-level `fortify/github-action` action. Note that this requires the [Fortify SSC Parser Plugin for Debricked results](https://github.com/fortify/fortify-ssc-parser-debricked-cyclonedx) to be installed on Fortify SSC, to allow for SSC to accept and process the Debricked scan results submitted by this action.

**`DEBRICKED_TOKEN`** - REQUIRED*       
Required when performing a Debricked Software Composition Analysis scan; see the [Generate access token](https://docs.debricked.com/product/administration/generate-access-token) section in the Debricked documentation for details on how to generate this token.

{{include:env-ssc-appversion.md}}

{{include:env-package.md}}

**`SC_SAST_SENSOR_VERSION`** - REQUIRED     
Version of the ScanCentral SAST sensor on which the scan should be performed. See [`fcli sc-sast scan start` documentation]({{var:fcli-doc-base-url}}/manpage/fcli-sc-sast-scan-start.html#_options_for_scanning_a_package_file) for details.

**`EXTRA_SC_SAST_SCAN_OPTS`** - OPTIONAL    
Extra ScanCentral SAST scan options; see [`fcli sc-sast scan start` documentation]({{var:fcli-doc-base-url}}/manpage/fcli-sc-sast-scan-start.html)

{{include:env-do-wait.md}}

{{include:env-do-job-summary.md}}

{{include:env-do-export.md}}

{{include:env-do-pr-comment.md}}

