# fortify/github-action/ssc-export@v1 


<!-- START-INCLUDE:p.marketing-intro.md -->

[Fortify Application Security](https://www.microfocus.com/en-us/solutions/application-security) provides your team with solutions to empower [DevSecOps](https://www.microfocus.com/en-us/cyberres/use-cases/devsecops) practices, enable [cloud transformation](https://www.microfocus.com/en-us/cyberres/use-cases/cloud-transformation), and secure your [software supply chain](https://www.microfocus.com/en-us/cyberres/use-cases/securing-the-software-supply-chain). As the sole Code Security solution with over two decades of expertise and acknowledged as a market leader by all major analysts, Fortify delivers the most adaptable, precise, and scalable AppSec platform available, supporting the breadth of tech you use and integrated into your preferred toolchain. We firmly believe that your great code [demands great security](https://www.microfocus.com/cyberres/application-security/developer-security), and with Fortify, go beyond 'check the box' security to achieve that.

<!-- END-INCLUDE:p.marketing-intro.md -->



<!-- START-INCLUDE:action-ssc-export.md -->

This action exports the latest vulnerability data from an SSC application version to the GitHub Code Scanning dashboard. Note that this may require a [GitHub Advanced Security](https://docs.github.com/en/get-started/learning-about-github/about-github-advanced-security) subscription, unless you're running this action on a public github.com repository.

### Action environment variable inputs


<!-- START-INCLUDE:env-ssc-connection.md -->

**`SSC_URL`** - REQUIRED   
Fortify Software Security Center URL, for example https://ssc.customer.fortifyhosted.net/

**`SSC_TOKEN`** - REQUIRED*   
Required when authenticating with an SSC token (recommended). Most actions should work fine with a `CIToken`.

**`SSC_USER` & `SSC_PASSWORD`** - REQUIRED*   
Required when authenticating with user credentials.

<!-- END-INCLUDE:env-ssc-connection.md -->



<!-- START-INCLUDE:env-ssc-appversion.md -->

**`SSC_APPVERSION`** - OPTIONAL   
Fortify SSC application version to use with this action. This can be specified either as a numeric application version id, or by providing application and version name in the format `<app-name>:<version-name>`. Default value is [`<github.action_repository>:<github.action_ref>`](https://docs.github.com/en/actions/learn-github-actions/contexts#github-context), for example `myOrg/myRepo:myBranch`.

<!-- END-INCLUDE:env-ssc-appversion.md -->


### Sample usage

The sample workflow below demonstrates how to configure the action for exporting SSC SAST vulnerability data to the GitHub Security Code Scanning dashboard.

```yaml
    steps:    
      - name: Export SSC vulnerability data to GitHub
        uses: fortify/github-action/ssc-export@v1
        env:
          SSC_URL: ${{secrets.SSC_URL}}
          SSC_TOKEN: ${{secrets.SSC_TOKEN}}
          # SSC_APPVERSION: MyApp:MyVersion
```

<!-- END-INCLUDE:action-ssc-export.md -->



<!-- START-INCLUDE:h2.support.md -->

## Support

The only warranties for products and services of Open Text and its affiliates and licensors (“Open Text”) are as may be set forth in the express warranty statements accompanying such products and services. Nothing herein should be construed as constituting an additional warranty. Open Text shall not be liable for technical or editorial errors or omissions contained herein. The information contained herein is subject to change without notice.

The software is provided "as is" and is not supported through the regular OpenText Support channels. Support requests may be submitted through the [GitHub Issues](https://github.com/fortify-ps/github-action/issues) page for this repository. A (free) GitHub account is required to submit new issues or to comment on existing issues. 

Support requests created through the GitHub Issues page may include bug reports, enhancement requests and general usage questions. Please avoid creating duplicate issues by checking whether there is any existing issue, either open or closed, that already addresses your question, bug or enhancement request. If an issue already exists, please add a comment to provide additional details if applicable.

Support requests on the GitHub Issues page are handled on a best-effort basis; there is no guaranteed response time, no guarantee that reported bugs will be fixed, and no guarantee that enhancement requests will be implemented. If you require dedicated support for this and other Fortify software, please consider purchasing OpenText Fortify Professional Services. OpenText Fortify Professional Services can assist with general usage questions, integration of the software into your processes, and implementing customizations, bug fixes, and feature requests (subject to feasibility analysis). Please contact your OpenText Sales representative or fill in the [Professional Services Contact Form](https://www.microfocus.com/en-us/cyberres/contact/professional-services) to obtain more information on pricing and the services that OpenText Fortify Professional Services can provide.

<!-- END-INCLUDE:h2.support.md -->


---

*[This document was auto-generated; do not edit by hand](https://github.com/fortify/shared-doc-resources/blob/main/USAGE.md)*
