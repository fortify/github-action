The [Fortify github-action repository]({{repo-url}}) hosts various Fortify-related GitHub Actions as listed in the sections below.

**Fortify on Demand**

* [`{{var:repo-url}}@<version>`](#primary-action)  
  For now, this action provides the same functionality as the `fod-sast-scan` action listed below. Future versions may add support for running other types of scans or performing other FoD actions.
* [`{{var:repo-url}}/fod-sast-scan@<version>`](#fod-sast-scan-action)  
  Package source code, submit SAST scan request to Fortify on Demand, optionally wait for completion and export results back to the GitHub Security dashboard.
* [`{{var:repo-url}}/package@<version>`](#package-action)  
  Package source code for running a SAST scan, using the latest version of ScanCentral Client.
* [`{{var:repo-url}}/fod-export@<version>`](#fod-export-action)  
  Export vulnerability data from Fortify on Demand to the GitHub Security dashboard.
* [`{{var:repo-url}}/setup@<version>`](#setup-action)  
  Install various Fortify tools like [fcli](https://github.com/fortify/fcli), [ScanCentral Client](https://www.microfocus.com/documentation/fortify-software-security-center/2310/SC_SAST_Help_23.1.0/index.htm#A_Clients.htm), [FortifyVulnerabilityExporter](https://github.com/fortify/FortifyVulnerabilityExporter) and [FortifyBugTrackerUtility](https://github.com/fortify-ps/FortifyBugTrackerUtility) for use in your pipeline
  
**SSC / ScanCentral SAST/ ScanCentral DAST**

* [`{{var:repo-url}}@<version>`](#primary-action)  
  For now, this action provides the same functionality as the `ssc-sast-scan` action listed below. Future versions may add support for running other types of scans or performing other SSC / ScanCentral actions.
* [`{{var:repo-url}}/sc-sast-scan@<version>`](#sc-sast-scan-action)  
  Package source code, submit SAST scan request to ScanCentral SAST, optionally wait for completion and export results back to the GitHub Security dashboard.
* [`{{var:repo-url}}/package@<version>`](#package-action)  
  Package source code for running a SAST scan, using the latest version of ScanCentral Client.
* [`{{var:repo-url}}/ssc-export@<version>`](#ssc-export-action)  
  Export vulnerability data from Fortify Software Security Center (SSC) to the GitHub Security dashboard.
* [`{{var:repo-url}}/setup@<version>`](#setup-action)  
  Install various Fortify tools like [fcli](https://github.com/fortify/fcli), [ScanCentral Client](https://www.microfocus.com/documentation/fortify-software-security-center/2310/SC_SAST_Help_23.1.0/index.htm#A_Clients.htm), [FortifyVulnerabilityExporter](https://github.com/fortify/FortifyVulnerabilityExporter) and [FortifyBugTrackerUtility](https://github.com/fortify-ps/FortifyBugTrackerUtility) for use in your pipeline

## Primary action

TODO

## setup action

TODO

## package action

TODO

## fod-sast-scan action

TODO

## fod-export action

TODO

## sc-sast-scan action

TODO

## ssc-export action

TODO
