# fortify/github-action/fod-sast-scan@v1 


<!-- START-INCLUDE:p.marketing-intro.md -->

[Fortify Application Security](https://www.microfocus.com/en-us/solutions/application-security) provides your team with solutions to empower [DevSecOps](https://www.microfocus.com/en-us/cyberres/use-cases/devsecops) practices, enable [cloud transformation](https://www.microfocus.com/en-us/cyberres/use-cases/cloud-transformation), and secure your [software supply chain](https://www.microfocus.com/en-us/cyberres/use-cases/securing-the-software-supply-chain). As the sole Code Security solution with over two decades of expertise and acknowledged as a market leader by all major analysts, Fortify delivers the most adaptable, precise, and scalable AppSec platform available, supporting the breadth of tech you use and integrated into your preferred toolchain. We firmly believe that your great code [demands great security](https://www.microfocus.com/cyberres/application-security/developer-security), and with Fortify, go beyond 'check the box' security to achieve that.

<!-- END-INCLUDE:p.marketing-intro.md -->



<!-- START-INCLUDE:action-fod-sast-scan.md -->

This action performs a SAST scan on Fortify on Demand (FoD). If software composition analysis of open source has been purchased and configured on the applicable release, this action can be used to perform a combined SAST and SCA (open source) scan. 

The SAST and optional open source scan performed by this action consists of the following steps:

* Login to FoD
* Package application source code using ScanCentral Client
* Submit the source code package to be scanned to FoD
* Optionally wait for the scan to complete
* Optionally export scan results to the GitHub Code Scanning dashboard

Before running this action, please ensure that the appropriate release has been created on FoD and has been configured for SAST scans. Future versions of this action may add support for automating app/release creation and scan setup. If open source scanning has been enabled in the FoD SAST scan configuration, be sure to pass the `-oss` option through the `EXTRA_PACKAGE_OPTS` environment variable.

### Action environment variable inputs


<!-- START-INCLUDE:env-fod-sast-scan.md -->



<!-- START-INCLUDE:env-fod-login.md -->


<!-- START-INCLUDE:env-fod-connection.md -->

**`FOD_URL`** - REQUIRED   
Fortify on Demand URL, for example https://ams.fortify.com

**`FOD_CLIENT_ID` & `FOD_CLIENT_SECRET`** - REQUIRED*    
Required when authenticating with an API key: FoD Client ID (API key) and Secret (API secret).

**`FOD_TENANT`, `FOD_USER` & `FOD_PASSWORD`** - REQUIRED*    
Required when authenticating with user credentials: FoD tenant, user and password. It's recommended to use a Personal Access Token instead of an actual user password.

<!-- END-INCLUDE:env-fod-connection.md -->


**`EXTRA_FOD_LOGIN_OPTS`** - OPTIONAL   
Extra FoD login options, for example for disabling SSL checks or changing connection time-outs; see [`fcli fod session login` documentation](https://fortify.github.io/fcli/v2.0.0//manpage/fcli-fod-session-login.html)

<!-- END-INCLUDE:env-fod-login.md -->



<!-- START-INCLUDE:env-fod-release.md -->

**`FOD_RELEASE`** - OPTIONAL    
Fortify on Demand release to use with this action. This can be specified either as a numeric release id, `<app-name>:<release-name>` (for non-microservices applications) or `<app-name>:<microservice-name>:<release-name>` (for microservices applications). Default value is [`${{ github.action_repository }}:${{ github.action_ref }}`](https://docs.github.com/en/actions/learn-github-actions/contexts#github-context), for example `myOrg/myRepo:myBranch`.

<!-- END-INCLUDE:env-fod-release.md -->



<!-- START-INCLUDE:env-fod-package.md -->

**`EXTRA_PACKAGE_OPTS`** - OPTIONAL     
By default, this action runs `scancentral package -o package.zip` to package application source code. he `EXTRA_PACKAGE_OPTS` environment variable can be used to specify additional packaging options. 

If FoD Software Composition Analysis has been purchased and configured on the applicable release, you'll need to pass the `-oss` option through this environment variable to generate and package the additional dependency files required. 

Based on the  automated build tool detection feature provided by ScanCentral Client, this default `scancentral` command is often sufficient to properly package application source code. Depending on your build setup, you may however need to configure the `EXTRA_PACKAGE_OPTS` environment variable to specify additional packaging options. 

As an example, if the build file that you want to use for packaging doesn't adhere  to common naming conventions, you can configure the `-bf <custom build file>` option using the `EXTRA_PACKAGE_OPTS` environment variable. See [Command-line options for the package command]({{var:sc-client-doc-base-url#CLI.htm#Package}}) for more information on available options.

<!-- END-INCLUDE:env-fod-package.md -->


**`EXTRA_FOD_SAST_SCAN_OPTS`** - OPTIONAL    
Extra FoD SAST scan options; see [`fcli fod sast-scan start` documentation](https://fortify.github.io/fcli/v2.0.0//manpage/fcli-fod-sast-scan-start.html)


<!-- START-INCLUDE:env-wait-export.md -->

**`DO_WAIT`** - OPTIONAL    
By default, this action will not wait until the scan has been completed. To have the workflow wait until the scan has been completed, set the `DO_WAIT` environment variable to `true`. Note that `DO_WAIT` is implied if `DO_EXPORT` is set to `true`; see below.

**`DO_EXPORT`** - OPTIONAL    
If set to `true`, this action will export scan results to the GitHub Security Code Scanning dashboard. Note that this may require a [GitHub Advanced Security](https://docs.github.com/en/get-started/learning-about-github/about-github-advanced-security) subscription, unless you're running this action on a public github.com repository.

<!-- END-INCLUDE:env-wait-export.md -->


<!-- END-INCLUDE:env-fod-sast-scan.md -->


### Sample usage

The sample workflow below demonstrates how to configure the action for running a SAST scan on FoD.

```yaml
    steps:    
      - name: Check out source code
        uses: actions/checkout@v4  
      - name: Run FoD SAST Scan
        uses: fortify/github-action/fod-sast-scan@v1
        env:
          FOD_URL: https://ams.fortify.com
          FOD_TENANT: ${{secrets.FOD_TENANT}}
          FOD_USER: ${{secrets.FOD_USER}}
          FOD_PASSWORD: ${{secrets.FOD_PAT}}
          # EXTRA_FOD_LOGIN_OPTS: --socket-timeout=60s
          # FOD_RELEASE: MyApp:MyRelease
          # EXTRA_PACKAGE_OPTS: -oss
          # DO_WAIT: true
          # DO_EXPORT: true
```

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
