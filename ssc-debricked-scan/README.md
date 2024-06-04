# fortify/github-action/ssc-debricked-scan@v1 


<!-- START-INCLUDE:p.marketing-intro.md -->

[Fortify Application Security](https://www.microfocus.com/en-us/solutions/application-security) provides your team with solutions to empower [DevSecOps](https://www.microfocus.com/en-us/cyberres/use-cases/devsecops) practices, enable [cloud transformation](https://www.microfocus.com/en-us/cyberres/use-cases/cloud-transformation), and secure your [software supply chain](https://www.microfocus.com/en-us/cyberres/use-cases/securing-the-software-supply-chain). As the sole Code Security solution with over two decades of expertise and acknowledged as a market leader by all major analysts, Fortify delivers the most adaptable, precise, and scalable AppSec platform available, supporting the breadth of tech you use and integrated into your preferred toolchain. We firmly believe that your great code [demands great security](https://www.microfocus.com/cyberres/application-security/developer-security), and with Fortify, go beyond 'check the box' security to achieve that.

<!-- END-INCLUDE:p.marketing-intro.md -->



<!-- START-INCLUDE:action-ssc-debricked-scan.md -->

This action performs a Debricked Software Composition Analysis (SCA) scan, consisting of the following steps:

* Login to Fortify SSC
* Run Debricked scan
* Publish Debricked scan results to Fortify SSC
* Optionally wait for SSC artifact processing to complete

Note that this action is explicitly meant for Debricked/SSC integration. If you wish to run a Debricked scan without publishing the results to SSC, please see the [Debricked GitHub Integration documentation](https://portal.debricked.com/integrations-48/integration-with-github-214#github-actions)


<!-- START-INCLUDE:action-prerequisites.md -->

### Prerequisites

This action assumes the standard software packages as provided by GitHub-hosted runners to be available. If you are using self-hosted runners, you may need to install some of these software packages in order to successfully use this action. In particular, not having the following software installed is known to cause issues when running `fortify/github-action` or one of its sub-actions:

* Node.js
* Visual C++ Redistributable (Windows-based runners only)
* Bash shell   
  If using Windows runners, this must be a Windows-based `bash` variant, for example as provided by MSYS2. You must make sure that this Windows-based `bash` variant is used for `run` steps that specify `shell: bash`. Actions will fail if the GitHub runner executes `bash` commands on the WSL-provided `bash.exe`

<!-- END-INCLUDE:action-prerequisites.md -->


Apart from the generic action prerequisites listed above, the following prerequisites apply to this specific action:

* The appropriate application version must exist on SSC. Future versions of this action may add support for automating application version creation.
* The [Fortify SSC Parser Plugin for Debricked results](https://github.com/fortify/fortify-ssc-parser-debricked-cyclonedx) must be installed on Fortify SSC, to allow for SSC to accept and process the Debricked scan results submitted by this action.

### Action environment variable inputs


<!-- START-INCLUDE:env-ssc-debricked-scan.md -->


<!-- START-INCLUDE:env-ssc-connection.md -->

**`SSC_URL`** - REQUIRED   
Fortify Software Security Center URL, for example https://ssc.customer.fortifyhosted.net/

**`SSC_TOKEN`** - REQUIRED*   
Required when authenticating with an SSC token (recommended). Most actions should work fine with a `CIToken`.

**`SSC_USER` & `SSC_PASSWORD`** - REQUIRED*   
Required when authenticating with SSC user credentials.

<!-- END-INCLUDE:env-ssc-connection.md -->



<!-- START-INCLUDE:env-ssc-login.md -->

**`EXTRA_SSC_LOGIN_OPTS`** - OPTIONAL    
Extra SSC login options, for example for disabling SSL checks or changing connection time-outs; see [`fcli ssc session login` documentation](https://fortify.github.io/fcli/v2.3.0//manpage/fcli-ssc-session-login.html).

<!-- END-INCLUDE:env-ssc-login.md -->


**`DEBRICKED_TOKEN`** - REQUIRED          
See the [Generate access token](https://docs.debricked.com/product/administration/generate-access-token) section in the Debricked documentation for details on how to generate this token.


<!-- START-INCLUDE:env-ssc-appversion.md -->

**`SSC_APPVERSION`** - OPTIONAL   
Fortify SSC application version to use with this action. This can be specified either as a numeric application version id, or by providing application and version name in the format `<app-name>:<version-name>`. Default value is [`<github.action_repository>:<github.action_ref>`](https://docs.github.com/en/actions/learn-github-actions/contexts#github-context), for example `myOrg/myRepo:myBranch`.

<!-- END-INCLUDE:env-ssc-appversion.md -->


**`DO_WAIT`** - OPTIONAL    
By default, this action will complete immediately after Debricked scan results have been uploaded to SSC. To have the workflow wait until the Debricked results have been processed by SSC (potentially failing if the results cannot be successfully processed), set the `DO_WAIT` environment variable to `true`.

For consistency with other actions, `DO_WAIT` is implied if `DO_EXPORT` is set to `true`, but since GitHub doesn't support importing Software Composition Analysis results, Debricked results will not be published to GitHub even if `DO_EXPORT` is set to `true`.

<!-- END-INCLUDE:env-ssc-debricked-scan.md -->



<!-- START-INCLUDE:env-setup.md -->

**`TOOL_DEFINITIONS`** - OPTIONAL   
Fortify tool definitions are used by this GitHub Action to determine available versions, download location and other details of various Fortify-related tools, as required for action execution. By default, the Fortify-provided tool definitions hosted at https://github.com/fortify/tool-definitions/releases/tag/v1 will be used. 

This environment variable allows for overriding the default tool definitions, pointing to either a URL or local (workspace) file. For example, if GitHub workflows are not allowed to download tools from their public internet locations, customers may host the tool installation bundles on an internal server, together with a customized tool definitions bundle that lists the alternative download URLs.

<!-- END-INCLUDE:env-setup.md -->


### Sample usage

The sample workflow below demonstrates how to configure the action for running a Debricked scan and publishing the results to Fortify SSC.

```yaml
    steps:    
      - name: Check out source code
        uses: actions/checkout@v4  
      - name: Run Debricked Scan
        uses: fortify/github-action/ssc-debricked-scan@v1
        env:
          SSC_URL: ${{secrets.SSC_URL}}
          SSC_TOKEN: ${{secrets.SSC_TOKEN}}
          # EXTRA_SSC_LOGIN_OPTS: --socket-timeout=60s
          # SSC_APPVERSION: MyApp:MyVersion
          DEBRICKED_TOKEN: ${{secrets.DEBRICKED_TOKEN}}
          # DO_WAIT: true
          # TOOL_DEFINITIONS: https://ftfy.mycompany.com/tool-definitions/v1/tool-definitions.yaml.zip
```

<!-- END-INCLUDE:action-ssc-debricked-scan.md -->



<!-- START-INCLUDE:h2.support.md -->

## Support

The only warranties for products and services of Open Text and its affiliates and licensors (“Open Text”) are as may be set forth in the express warranty statements accompanying such products and services. Nothing herein should be construed as constituting an additional warranty. Open Text shall not be liable for technical or editorial errors or omissions contained herein. The information contained herein is subject to change without notice.

The software is provided "as is" and is not supported through the regular OpenText Support channels. Support requests may be submitted through the [GitHub Issues](https://github.com/fortify/github-action/issues) page for this repository. A (free) GitHub account is required to submit new issues or to comment on existing issues. 

Support requests created through the GitHub Issues page may include bug reports, enhancement requests and general usage questions. Please avoid creating duplicate issues by checking whether there is any existing issue, either open or closed, that already addresses your question, bug or enhancement request. If an issue already exists, please add a comment to provide additional details if applicable.

Support requests on the GitHub Issues page are handled on a best-effort basis; there is no guaranteed response time, no guarantee that reported bugs will be fixed, and no guarantee that enhancement requests will be implemented. If you require dedicated support for this and other Fortify software, please consider purchasing OpenText Fortify Professional Services. OpenText Fortify Professional Services can assist with general usage questions, integration of the software into your processes, and implementing customizations, bug fixes, and feature requests (subject to feasibility analysis). Please contact your OpenText Sales representative or fill in the [Professional Services Contact Form](https://www.microfocus.com/en-us/cyberres/contact/professional-services) to obtain more information on pricing and the services that OpenText Fortify Professional Services can provide.

<!-- END-INCLUDE:h2.support.md -->


---

*[This document was auto-generated; do not edit by hand](https://github.com/fortify/shared-doc-resources/blob/main/USAGE.md)*
