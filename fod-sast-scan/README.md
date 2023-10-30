# fortify/github-action/fod-sast-scan@v1 


<!-- START-INCLUDE:p.marketing-intro.md -->

[Fortify Application Security](https://www.microfocus.com/en-us/solutions/application-security) provides your team with solutions to empower [DevSecOps](https://www.microfocus.com/en-us/cyberres/use-cases/devsecops) practices, enable [cloud transformation](https://www.microfocus.com/en-us/cyberres/use-cases/cloud-transformation), and secure your [software supply chain](https://www.microfocus.com/en-us/cyberres/use-cases/securing-the-software-supply-chain). As the sole Code Security solution with over two decades of expertise and acknowledged as a market leader by all major analysts, Fortify delivers the most adaptable, precise, and scalable AppSec platform available, supporting the breadth of tech you use and integrated into your preferred toolchain. We firmly believe that your great code [demands great security](https://www.microfocus.com/cyberres/application-security/developer-security), and with Fortify, go beyond 'check the box' security to achieve that.

<!-- END-INCLUDE:p.marketing-intro.md -->



<!-- START-INCLUDE:action-fod-sast-scan.md -->

This action performs a SAST scan (optionally combined with an open-source scan) on Fortify on Demand, consisting of the following steps:

* Login to FoD
* Package application source code using ScanCentral Client
* Submit the source code package to be scanned to FoD
* Optionally wait for the scan to complete
* Optionally export scan results to the GitHub Code Scanning dashboard

Before running this action, please ensure that the appropriate release has been created on FoD and has been configured for SAST scans. Future versions of this action may add support for automating app/release creation and scan setup. If Open Source scanning has been enabled in the FoD SAST scan configuration, you'll need to pass the `-oss` option through the `EXTRA_PACKAGE_OPTS` environment variable.

### Action environment variable inputs


<!-- START-INCLUDE:env-fod-sast-scan.md -->



<!-- START-INCLUDE:env-fod-login.md -->

**`FOD_URL`**    
Required: Fortify on Demand URL, for example https://ams.fortify.com

**`FOD_CLIENT_ID` & `FOD_CLIENT_SECRET`**   
Required when authenticating with an API key: FoD Client ID (API key) and Secret (API secret)

**`FOD_TENANT`, `FOD_USER` & `FOD_PASSWORD`**   
Required when authenticating with user credentials: FoD tenant, user and password. It's recommended to use a Personal Access Token instead of an actual user password.

**`EXTRA_FOD_LOGIN_OPTS`**    
Optional: Extra FoD login options, for example for disabling SSL checks or changing connection time-outs; see [`fcli fod session login` documentation](https://fortify.github.io/fcli/v2.0.0//manpage/fcli-fod-session-login.html)

<!-- END-INCLUDE:env-fod-login.md -->



<!-- START-INCLUDE:env-fod-release.md -->

**`FOD_RELEASE`**    
Required: Fortify on Demand release to use with this action. This can be specified either as a numeric release id, `<app>:<release>` (for non-microservices applications) or `<app>:<microservice>:<release>` (for microservices applications).

<!-- END-INCLUDE:env-fod-release.md -->



<!-- START-INCLUDE:env-package.md -->

**`EXTRA_PACKAGE_OPTS`**    
Optional: By default, this action runs `scancentral package -o package.zip`. The `EXTRA_PACKAGE_OPTS` environment variable can be used to specify additional packaging options like `-bt none` to disable automatic build tool detection, or `-oss` to collect additional files for an open-source scan (FoD only).

<!-- END-INCLUDE:env-package.md -->


**`EXTRA_FOD_SAST_SCAN_OPTS`**    
Optional: Extra FoD SAST scan options; see [`fcli fod sast-scan start` documentation](https://fortify.github.io/fcli/v2.0.0//manpage/fcli-fod-sast-scan-start.html)

**`DO_WAIT`**    
Optional: By default, this action will not wait until the scan has been completed. To have the workflow wait until the scan has been completed, set the `DO_WAIT` environment variable to `true`. Note that `DO_WAIT` is implied if `DO_EXPORT` is set to `true`; see below.

**`DO_EXPORT`**    
Optional: If set to `true`, this action will export scan results to the GitHub Security Code Scanning dashboard.

<!-- END-INCLUDE:env-fod-sast-scan.md -->


<!-- END-INCLUDE:action-fod-sast-scan.md -->



<!-- START-INCLUDE:h2.support.md -->

## Support

The only warranties for products and services of Open Text and its affiliates and licensors (“Open Text”) are as may be set forth in the express warranty statements accompanying such products and services. Nothing herein should be construed as constituting an additional warranty. Open Text shall not be liable for technical or editorial errors or omissions contained herein. The information contained herein is subject to change without notice.

The software is provided "as is" and is not supported through the regular OpenText Support channels. Support requests may be submitted through the [GitHub Issues](https://github.com/fortify-ps/github-action/issues) page for this repository. A (free) GitHub account is required to submit new issues or to comment on existing issues. 

Support requests created through the GitHub Issues page may include bug reports, enhancement requests and general usage questions. Please avoid creating duplicate issues by checking whether there is any existing issue, either open or closed, that already addresses your question, bug or enhancement request. If an issue already exists, please add a comment to provide additional details if applicable.

Support requests on the GitHub Issues page are handled on a best-effort basis; there is no guaranteed response time, no guarantee that reported bugs will be fixed, and no guarantee that enhancement requests will be implemented. If you require dedicated support for this and other Fortify software, please consider purchasing OpenText Fortify Professional Services. OpenText Fortify Professional Services can assist with general usage questions, integration of the software into your processes, and implementing customizations, bug fixes, and feature requests (subject to feasibility analysis). Please contact your OpenText Sales representative or fill in the [Professional Services Contact Form](https://www.microfocus.com/en-us/cyberres/contact/professional-services) to obtain more information on pricing and the services that OpenText Fortify Professional Services can provide.

<!-- END-INCLUDE:h2.support.md -->


---

*[This document was auto-generated; do not edit by hand](https://github.com/fortify/shared-doc-resources/blob/main/USAGE.md)*
