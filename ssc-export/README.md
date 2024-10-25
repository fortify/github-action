# fortify/github-action/ssc-export@v1 


<!-- START-INCLUDE:p.marketing-intro.md -->

[Fortify Application Security](https://www.microfocus.com/en-us/solutions/application-security) provides your team with solutions to empower [DevSecOps](https://www.microfocus.com/en-us/cyberres/use-cases/devsecops) practices, enable [cloud transformation](https://www.microfocus.com/en-us/cyberres/use-cases/cloud-transformation), and secure your [software supply chain](https://www.microfocus.com/en-us/cyberres/use-cases/securing-the-software-supply-chain). As the sole Code Security solution with over two decades of expertise and acknowledged as a market leader by all major analysts, Fortify delivers the most adaptable, precise, and scalable AppSec platform available, supporting the breadth of tech you use and integrated into your preferred toolchain. We firmly believe that your great code [demands great security](https://www.microfocus.com/cyberres/application-security/developer-security), and with Fortify, go beyond 'check the box' security to achieve that.

<!-- END-INCLUDE:p.marketing-intro.md -->



<!-- START-INCLUDE:action-ssc-export.md -->

This action exports the latest vulnerability data from an SSC application version to the GitHub Code Scanning dashboard. Note that this may require a [GitHub Advanced Security](https://docs.github.com/en/get-started/learning-about-github/about-github-advanced-security) subscription, unless you're running this action on a public github.com repository.


<!-- START-INCLUDE:action-prerequisites.md -->

### Prerequisites

This action assumes the standard software packages as provided by GitHub-hosted runners to be available. If you are using self-hosted runners, you may need to install some of these software packages in order to successfully use this action. In particular, not having the following software installed is known to cause issues when running `fortify/github-action` or one of its sub-actions:

* Node.js
* Visual C++ Redistributable (Windows-based runners only)
* Bash shell   
  If using Windows runners, this must be a Windows-based `bash` variant, for example as provided by MSYS2. You must make sure that this Windows-based `bash` variant is used for `run` steps that specify `shell: bash`. Actions will fail if the GitHub runner executes `bash` commands on the WSL-provided `bash.exe`

<!-- END-INCLUDE:action-prerequisites.md -->


### Action environment variable inputs


<!-- START-INCLUDE:env-ssc-connection.md -->

**`SSC_URL`** - REQUIRED   
Fortify Software Security Center URL, for example https://ssc.customer.fortifyhosted.net/. Note: Using GitHub Secrets to define this URL may cause links back to SSC to be rendered incorrectly, for example in GitHub Action workflow summaries. It is highly recommended to either hard-code the URL in your workflow, or to use [GitHub Variables](https://docs.github.com/en/actions/writing-workflows/choosing-what-your-workflow-does/store-information-in-variables) instead of GitHub Secrets.

**`SSC_TOKEN`** - REQUIRED*   
Required when authenticating with an SSC token (recommended). Most actions should work fine with a `CIToken`.

**`SSC_USER` & `SSC_PASSWORD`** - REQUIRED*   
Required when authenticating with SSC user credentials.

<!-- END-INCLUDE:env-ssc-connection.md -->



<!-- START-INCLUDE:env-ssc-appversion.md -->

**`SSC_APPVERSION`** - OPTIONAL   
Fortify SSC application version to use with this action. This can be specified either as a numeric application version id, or by providing application and version name in the format `<app-name>:<version-name>`. Default value is [`<github.repository>:<github.head_ref || github.ref_name>`](https://docs.github.com/en/actions/learn-github-actions/contexts#github-context), for example `myOrg/myRepo:myBranch`.

<!-- END-INCLUDE:env-ssc-appversion.md -->



<!-- START-INCLUDE:env-do-export.md -->

**`DO_EXPORT`, `EXPORT_ACTION`, `EXPORT_EXTRA_OPTS`** - OPTIONAL    
If `DO_EXPORT` is set to `true` (implied if any of the other two `EXPORT_*` variables are set, and implies `DO_WAIT`) or when explicitly invoking the `fortify/github-action/fod-export` or `fortify/github-action/ssc-export` actions, this action will will export scan results to the GitHub Security Code Scanning dashboard using the fcli-provided [FoD `github-sast-report`](https://fortify.github.io/fcli/v2.8.0/fod-actions.html#_github_sast_report) or [SSC `github-sast-action`](https://fortify.github.io/fcli/v2.8.0/ssc-actions.html#_github_sast_report) action or, if specified, the custom fcli action specified through `EXPORT_ACTION`.  `EXPORT_ACTION` may point to a local file or URL; this custom fcli action must support (at least) the exact same action parameters (including any environment variable based default values for those parameters) as the built-in fcli action. Any extra options for the fcli action can be passed through the `EXPORT_EXTRA_OPTS` environment variable, for example to specify the SSC filter set from which to load issue data, or to allow an unsigned custom action to be used.

Note that this may require a [GitHub Advanced Security](https://docs.github.com/en/get-started/learning-about-github/about-github-advanced-security) subscription, unless you're running this action on a public github.com repository. GitHub only supports importing SAST results; other results will not exported to GitHub.

<!-- END-INCLUDE:env-do-export.md -->



<!-- START-INCLUDE:env-setup.md -->

**`TOOL_DEFINITIONS`** - OPTIONAL   
Fortify tool definitions are used by this GitHub Action to determine available versions, download location and other details of various Fortify-related tools, as required for action execution. By default, the Fortify-provided tool definitions hosted at https://github.com/fortify/tool-definitions/releases/tag/v1 will be used. 

This environment variable allows for overriding the default tool definitions, pointing to either a URL or local (workspace) file. For example, if GitHub workflows are not allowed to download tools from their public internet locations, customers may host the tool installation bundles on an internal server, together with a customized tool definitions bundle that lists the alternative download URLs.

<!-- END-INCLUDE:env-setup.md -->


### Sample usage

The sample workflow below demonstrates how to configure the action for exporting SSC SAST vulnerability data to the GitHub Security Code Scanning dashboard.

```yaml
    steps:    
      - name: Export SSC vulnerability data to GitHub
        uses: fortify/github-action/ssc-export@v1
        env:
          SSC_URL: ${{vars.SSC_URL}}
          SSC_TOKEN: ${{secrets.SSC_TOKEN}}
          # SSC_APPVERSION: MyApp:MyVersion
          # TOOL_DEFINITIONS: https://ftfy.mycompany.com/tool-definitions/v1/tool-definitions.yaml.zip
```

<!-- END-INCLUDE:action-ssc-export.md -->



<!-- START-INCLUDE:h2.support.md -->

## Support

The only warranties for products and services of Open Text and its affiliates and licensors (“Open Text”) are as may be set forth in the express warranty statements accompanying such products and services. Nothing herein should be construed as constituting an additional warranty. Open Text shall not be liable for technical or editorial errors or omissions contained herein. The information contained herein is subject to change without notice.

The software is provided "as is" and is not supported through the regular OpenText Support channels. Support requests may be submitted through the [GitHub Issues](https://github.com/fortify/github-action/issues) page for this repository. A (free) GitHub account is required to submit new issues or to comment on existing issues. 

Support requests created through the GitHub Issues page may include bug reports, enhancement requests and general usage questions. Please avoid creating duplicate issues by checking whether there is any existing issue, either open or closed, that already addresses your question, bug or enhancement request. If an issue already exists, please add a comment to provide additional details if applicable.

Support requests on the GitHub Issues page are handled on a best-effort basis; there is no guaranteed response time, no guarantee that reported bugs will be fixed, and no guarantee that enhancement requests will be implemented. If you require dedicated support for this and other Fortify software, please consider purchasing OpenText Fortify Professional Services. OpenText Fortify Professional Services can assist with general usage questions, integration of the software into your processes, and implementing customizations, bug fixes, and feature requests (subject to feasibility analysis). Please contact your OpenText Sales representative or fill in the [Professional Services Contact Form](https://www.microfocus.com/en-us/cyberres/contact/professional-services) to obtain more information on pricing and the services that OpenText Fortify Professional Services can provide.

<!-- END-INCLUDE:h2.support.md -->


---

*[This document was auto-generated; do not edit by hand](https://github.com/fortify/shared-doc-resources/blob/main/USAGE.md)*
