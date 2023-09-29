# Fortify GitHub Actions 


<!-- START-INCLUDE:p.marketing-intro.md -->

[Fortify Application Security](https://www.microfocus.com/en-us/solutions/application-security) provides your team with solutions to empower [DevSecOps](https://www.microfocus.com/en-us/cyberres/use-cases/devsecops) practices, enable [cloud transformation](https://www.microfocus.com/en-us/cyberres/use-cases/cloud-transformation), and secure your [software supply chain](https://www.microfocus.com/en-us/cyberres/use-cases/securing-the-software-supply-chain). As the sole Code Security solution with over two decades of expertise and acknowledged as a market leader by all major analysts, Fortify delivers the most adaptable, precise, and scalable AppSec platform available, supporting the breadth of tech you use and integrated into your preferred toolchain. We firmly believe that your great code [demands great security](https://www.microfocus.com/cyberres/application-security/developer-security), and with Fortify, go beyond 'check the box' security to achieve that.

<!-- END-INCLUDE:p.marketing-intro.md -->



<!-- START-INCLUDE:repo-intro.md -->

The [Fortify github-action repository]({{repo-url}}) hosts various Fortify-related GitHub Actions as listed in the sections below.

**Fortify on Demand**

* [`https://github.com/fortify-ps/github-action@<version>`](#primary-action)  
  For now, this action provides the same functionality as the `fod-sast-scan` action listed below. Future versions may add support for running other types of scans or performing other FoD actions.
* [`https://github.com/fortify-ps/github-action/fod-sast-scan@<version>`](#fod-sast-scan-action)  
  Package source code, submit SAST scan request to Fortify on Demand, optionally wait for completion and export results back to the GitHub Security dashboard.
* [`https://github.com/fortify-ps/github-action/package@<version>`](#package-action)  
  Package source code for running a SAST scan, using the latest version of ScanCentral Client.
* [`https://github.com/fortify-ps/github-action/fod-export@<version>`](#fod-export-action)  
  Export vulnerability data from Fortify on Demand to the GitHub Security dashboard.
* [`https://github.com/fortify-ps/github-action/setup@<version>`](#setup-action)  
  Install various Fortify tools like [fcli](https://github.com/fortify/fcli), [ScanCentral Client](https://www.microfocus.com/documentation/fortify-software-security-center/2310/SC_SAST_Help_23.1.0/index.htm#A_Clients.htm), [FortifyVulnerabilityExporter](https://github.com/fortify/FortifyVulnerabilityExporter) and [FortifyBugTrackerUtility](https://github.com/fortify-ps/FortifyBugTrackerUtility) for use in your pipeline
  
**SSC / ScanCentral SAST/ ScanCentral DAST**

* [`https://github.com/fortify-ps/github-action@<version>`](#primary-action)  
  For now, this action provides the same functionality as the `ssc-sast-scan` action listed below. Future versions may add support for running other types of scans or performing other SSC / ScanCentral actions.
* [`https://github.com/fortify-ps/github-action/sc-sast-scan@<version>`](#sc-sast-scan-action)  
  Package source code, submit SAST scan request to ScanCentral SAST, optionally wait for completion and export results back to the GitHub Security dashboard.
* [`https://github.com/fortify-ps/github-action/package@<version>`](#package-action)  
  Package source code for running a SAST scan, using the latest version of ScanCentral Client.
* [`https://github.com/fortify-ps/github-action/ssc-export@<version>`](#ssc-export-action)  
  Export vulnerability data from Fortify Software Security Center (SSC) to the GitHub Security dashboard.
* [`https://github.com/fortify-ps/github-action/setup@<version>`](#setup-action)  
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

<!-- END-INCLUDE:repo-intro.md -->


## Resources


<!-- START-INCLUDE:repo-resources.md -->

* **Contributing Guidelines**: [CONTRIBUTING.md](https://github.com/fortify-ps/github-action/blob/main/CONTRIBUTING.md)
* **Code of Conduct**: [CODE_OF_CONDUCT.md](https://github.com/fortify-ps/github-action/blob/main/CODE_OF_CONDUCT.md)
* **License**: [LICENSE.txt](https://github.com/fortify-ps/github-action/blob/main/LICENSE.txt)

<!-- END-INCLUDE:repo-resources.md -->


## Support

The only warranties for products and services of Open Text and its affiliates and licensors (“Open Text”) are as may be set forth in the express warranty statements accompanying such products and services. Nothing herein should be construed as constituting an additional warranty. Open Text shall not be liable for technical or editorial errors or omissions contained herein. The information contained herein is subject to change without notice.

The software is provided "as is" and is not supported through the regular OpenText Support channels. Support requests may be submitted through the [GitHub Issues](https://github.com/fortify-ps/github-action/issues) page for this repository. A (free) GitHub account is required to submit new issues or to comment on existing issues. 

Support requests created through the GitHub Issues page may include bug reports, enhancement requests and general usage questions. Please avoid creating duplicate issues by checking whether there is any existing issue, either open or closed, that already addresses your question, bug or enhancement request. If an issue already exists, please add a comment to provide additional details if applicable.

Support requests on the GitHub Issues page are handled on a best-effort basis; there is no guaranteed response time, no guarantee that reported bugs will be fixed, and no guarantee that enhancement requests will be implemented. If you require dedicated support for this and other Fortify software, please consider purchasing OpenText Fortify Professional Services. OpenText Fortify Professional Services can assist with general usage questions, integration of the software into your processes, and implementing customizations, bug fixes, and feature requests (subject to feasibility analysis). Please contact your OpenText Sales representative or fill in the [Professional Services Contact Form](https://www.microfocus.com/en-us/cyberres/contact/professional-services) to obtain more information on pricing and the services that OpenText Fortify Professional Services can provide.

---

*[This document was auto-generated from README.template.md; do not edit by hand](https://github.com/fortify/shared-doc-resources/blob/main/USAGE.md)*
