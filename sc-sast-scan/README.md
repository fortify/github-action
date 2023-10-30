# fortify/github-action/sc-sast-scan@v1 


<!-- START-INCLUDE:p.marketing-intro.md -->

[Fortify Application Security](https://www.microfocus.com/en-us/solutions/application-security) provides your team with solutions to empower [DevSecOps](https://www.microfocus.com/en-us/cyberres/use-cases/devsecops) practices, enable [cloud transformation](https://www.microfocus.com/en-us/cyberres/use-cases/cloud-transformation), and secure your [software supply chain](https://www.microfocus.com/en-us/cyberres/use-cases/securing-the-software-supply-chain). As the sole Code Security solution with over two decades of expertise and acknowledged as a market leader by all major analysts, Fortify delivers the most adaptable, precise, and scalable AppSec platform available, supporting the breadth of tech you use and integrated into your preferred toolchain. We firmly believe that your great code [demands great security](https://www.microfocus.com/cyberres/application-security/developer-security), and with Fortify, go beyond 'check the box' security to achieve that.

<!-- END-INCLUDE:p.marketing-intro.md -->



<!-- START-INCLUDE:action-sc-sast-scan.md -->

This action performs a SAST scan on ScanCentral SAST, consisting of the following steps:

* Login to ScanCentral SAST Controller
* Package application source code using ScanCentral Client
* Submit the source code package to be scanned to ScanCentral SAST Controller
* Optionally wait for the scan to complete
* Optionally export scan results to the GitHub Code Scanning dashboard

Before running this action, please ensure that the appropriate application version has been created on SSC. Future versions of this action may add support for automating application version creation.

### Action environment variable inputs


<!-- START-INCLUDE:env-sc-sast-scan.md -->



<!-- START-INCLUDE:env-sc-sast-login.md -->


<!-- START-INCLUDE:env-ssc-connection.md -->

**`SSC_URL`**    
(Required) Fortify Software Security Center URL, for example https://ssc.customer.fortifyhosted.net/

**`SSC_TOKEN`**   
Required when authenticating with an SSC token (recommended). Most actions should work fine with a `CIToken`.

**`SSC_USER` & `SSC_PASSWORD`**   
Required when authenticating with user credentials.

<!-- END-INCLUDE:env-ssc-connection.md -->


**`SC_SAST_CLIENT_AUTH_TOKEN`**   
Required: ScanCentral SAST Client Authentication Token for authenticating with ScanCentral SAST Controller.

**`EXTRA_SC_SAST_LOGIN_OPTS`**    
Optional: Extra ScanCentral SAST login options, for example for disabling SSL checks or changing connection time-outs; see [`fcli sc-sast session login` documentation](https://fortify.github.io/fcli/v2.0.0//manpage/fcli-sc-sast-session-login.html).

<!-- END-INCLUDE:env-sc-sast-login.md -->



<!-- START-INCLUDE:env-ssc-appversion.md -->

**`SSC_APPVERSION`**    
Required: Fortify SSC application version to use with this action. This can be specified either as a numeric application version id, or by providing application and version name in the format `<app>:<release>`.

<!-- END-INCLUDE:env-ssc-appversion.md -->



<!-- START-INCLUDE:env-package.md -->

**`EXTRA_PACKAGE_OPTS`**    
Optional: By default, this action runs `scancentral package -o package.zip`. The `EXTRA_PACKAGE_OPTS` environment variable can be used to specify additional packaging options like `-bt none` to disable automatic build tool detection, or `-oss` to collect additional files for an open-source scan (FoD only).

<!-- END-INCLUDE:env-package.md -->


**`EXTRA_SC_SAST_SCAN_OPTS`**    
Optional: Extra ScanCentral SAST scan options; see [`fcli sc-sast scan start` documentation](https://fortify.github.io/fcli/v2.0.0//manpage/fcli-sc-sast-scan-start.html)

**`DO_WAIT`**    
Optional: By default, this action will not wait until the scan has been completed. To have the workflow wait until the scan has been completed, set the `DO_WAIT` environment variable to `true`. Note that `DO_WAIT` is implied if `DO_EXPORT` is set to `true`; see below.

**`DO_EXPORT`**    
Optional: If set to `true`, this action will export scan results to the GitHub Security Code Scanning dashboard.

<!-- END-INCLUDE:env-sc-sast-scan.md -->


### Sample usage

The sample workflow below demonstrates how to configure the action for running a SAST scan on ScanCentral SAST.

```yaml
    steps:    
      - name: Check out source code
        uses: actions/checkout@v4  
      - name: Run ScanCentral SAST Scan
        uses: fortify/github-action/sc-sast-scan@v1
        env:
          SSC_URL: ${{secrets.SSC_URL}}
          SSC_TOKEN: ${{secrets.SSC_TOKEN}}
          SC_SAST_CLIENT_AUTH_TOKEN: ${{secrets.CLIENT_AUTH_TOKEN}}
          EXTRA_SC_SAST_LOGIN_OPTS: --socket-timeout=60s
          SSC_APPVERSION: MyApp:MyVersion
          EXTRA_PACKAGE_OPTS: -bt mvn
          # DO_WAIT: true # Ignored due to DO_EXPORT below
          DO_EXPORT: true
```

<!-- END-INCLUDE:action-sc-sast-scan.md -->



<!-- START-INCLUDE:h2.support.md -->

## Support

The only warranties for products and services of Open Text and its affiliates and licensors (“Open Text”) are as may be set forth in the express warranty statements accompanying such products and services. Nothing herein should be construed as constituting an additional warranty. Open Text shall not be liable for technical or editorial errors or omissions contained herein. The information contained herein is subject to change without notice.

The software is provided "as is" and is not supported through the regular OpenText Support channels. Support requests may be submitted through the [GitHub Issues](https://github.com/fortify-ps/github-action/issues) page for this repository. A (free) GitHub account is required to submit new issues or to comment on existing issues. 

Support requests created through the GitHub Issues page may include bug reports, enhancement requests and general usage questions. Please avoid creating duplicate issues by checking whether there is any existing issue, either open or closed, that already addresses your question, bug or enhancement request. If an issue already exists, please add a comment to provide additional details if applicable.

Support requests on the GitHub Issues page are handled on a best-effort basis; there is no guaranteed response time, no guarantee that reported bugs will be fixed, and no guarantee that enhancement requests will be implemented. If you require dedicated support for this and other Fortify software, please consider purchasing OpenText Fortify Professional Services. OpenText Fortify Professional Services can assist with general usage questions, integration of the software into your processes, and implementing customizations, bug fixes, and feature requests (subject to feasibility analysis). Please contact your OpenText Sales representative or fill in the [Professional Services Contact Form](https://www.microfocus.com/en-us/cyberres/contact/professional-services) to obtain more information on pricing and the services that OpenText Fortify Professional Services can provide.

<!-- END-INCLUDE:h2.support.md -->


---

*[This document was auto-generated; do not edit by hand](https://github.com/fortify/shared-doc-resources/blob/main/USAGE.md)*
