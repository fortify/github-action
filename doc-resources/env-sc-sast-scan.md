
{{include:env-sc-sast-login.md}}

{{include:env-ssc-appversion.md}}

{{include:env-package.md}}

**`SC_SAST_SENSOR_VERSION`** - REQUIRED     
Version of the ScanCentral SAST sensor on which the scan should be performed. See [`fcli sc-sast scan start` documentation]({{var:fcli-doc-base-url}}/manpage/fcli-sc-sast-scan-start.html#_options_for_scanning_a_package_file) for details.

**`EXTRA_SC_SAST_SCAN_OPTS`** - OPTIONAL    
Extra ScanCentral SAST scan options; see [`fcli sc-sast scan start` documentation]({{var:fcli-doc-base-url}}/manpage/fcli-sc-sast-scan-start.html)

{{include:env-wait-export.md}}
