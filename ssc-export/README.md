# fortify/github-action/ssc-export@v1 


<!-- START-INCLUDE:p.marketing-intro.md -->

[Fortify Application Security](https://www.microfocus.com/en-us/solutions/application-security) provides your team with solutions to empower [DevSecOps](https://www.microfocus.com/en-us/cyberres/use-cases/devsecops) practices, enable [cloud transformation](https://www.microfocus.com/en-us/cyberres/use-cases/cloud-transformation), and secure your [software supply chain](https://www.microfocus.com/en-us/cyberres/use-cases/securing-the-software-supply-chain). As the sole Code Security solution with over two decades of expertise and acknowledged as a market leader by all major analysts, Fortify delivers the most adaptable, precise, and scalable AppSec platform available, supporting the breadth of tech you use and integrated into your preferred toolchain. We firmly believe that your great code [demands great security](https://www.microfocus.com/cyberres/application-security/developer-security), and with Fortify, go beyond 'check the box' security to achieve that.

<!-- END-INCLUDE:p.marketing-intro.md -->



<!-- START-INCLUDE:action/ssc-export/readme.md -->

This action exports the latest vulnerability data from an SSC application version to the GitHub Code Scanning dashboard. Note that this may require a [GitHub Advanced Security](https://docs.github.com/en/get-started/learning-about-github/about-github-advanced-security) subscription, unless you're running this action on a public github.com repository.


<!-- START-INCLUDE:action/generic/prerequisites-h3.md -->

### Prerequisites


<!-- START-INCLUDE:action/generic/prerequisites.md -->

This action assumes the standard software packages as provided by GitHub-hosted runners to be available. If you are using self-hosted runners, you may need to install some of these software packages in order to successfully use this action. In particular, not having the following software installed is known to cause issues when running `fortify/github-action` or one of its sub-actions:

* Node.js
* Visual C++ Redistributable (Windows-based runners only)
* Bash shell   
  If using Windows runners, this must be a Windows-based `bash` variant, for example as provided by MSYS2. You must make sure that this Windows-based `bash` variant is used for `run` steps that specify `shell: bash`. Actions will fail if the GitHub runner executes `bash` commands on the WSL-provided `bash.exe`

<!-- END-INCLUDE:action/generic/prerequisites.md -->


<!-- END-INCLUDE:action/generic/prerequisites-h3.md -->


### Sample usage

The sample workflow below demonstrates how to configure the action for exporting SSC SAST vulnerability data to the GitHub Security Code Scanning dashboard.

```yaml
    steps:    
      - name: Export SSC vulnerability data to GitHub
        uses: fortify/github-action/ssc-export@v1
        env:
          SSC_URL: ${{vars.SSC_URL}}
          SSC_TOKEN: ${{secrets.SSC_TOKEN}}
          # SSC_LOGIN_EXTRA_OPTS: --socket-timeout=60s
          # SSC_APPVERSION: MyApp:MyVersion
          # EXPORT_ACTION: https://scm.my.org/shared-repos/fcli-actions/github-sast-report.yaml
          # EXPORT_EXTRA_OPTS: --on-unsigned=ignore
          # TOOL_DEFINITIONS: https://ftfy.mycompany.com/tool-definitions/v1/tool-definitions.yaml.zip
```

### Action environment variable inputs

This section lists the environment variables that can be specified in the `env:` clause for this GitHub Action. Any environment variables marked in **bold** are required.

| Environment variable | Description |
| :--- | :--- |
|**SSC_URL**|Fortify Software Security Center URL, for example https://ssc.customer.fortifyhosted.net/. Note: Using GitHub Secrets to define this URL may cause links back to SSC to be rendered incorrectly, for example in GitHub Action workflow summaries. It is highly recommended to either hard-code the URL in your workflow, or to use [GitHub Variables](https://docs.github.com/en/actions/writing-workflows/choosing-what-your-workflow-does/store-information-in-variables) instead of GitHub Secrets.|
|**SSC_TOKEN**|Required when authenticating with an SSC token (recommended). Most actions should work fine with a `CIToken`.|
|**SSC_USER<br/>SSC_PASSWORD**|Required when authenticating with SSC user credentials.|
|SSC_LOGIN_EXTRA_OPTS<br/>EXTRA_SSC_LOGIN_OPTS|Extra SSC login options, for example for disabling SSL checks or changing connection time-outs; see [`fcli ssc session login` documentation](https://fortify.github.io/fcli/v2.9.1//manpage/fcli-ssc-session-login.html). Note that `EXTRA_SSC_LOGIN_OPTS` is deprecated; please use `SSC_LOGIN_EXTRA_OPTS`.|
|SSC_APPVERSION|Fortify SSC application version to use with this action. This can be specified either as a numeric application version id, or by providing application and version name in the format `<app-name>:<version-name>`. Default value is based on repository and branch name, for example `myOrg/myRepo:myBranch`.|
| EXPORT_ACTION<br/>EXPORT_EXTRA_OPTS | This GitHub Action will will export scan results to the GitHub Security Code Scanning dashboard using the fcli-provided [SSC `github-sast-report`](https://fortify.github.io/fcli/v2.9.1/ssc-actions.html#_github_sast_report) action or, if specified, the custom fcli action specified through `EXPORT_ACTION`. Extra options for the fcli action can be passed through the `EXPORT_EXTRA_OPTS` environment variable, for example to to allow an unsigned custom action to be used or to specify an alternative SSC filter set. Please see the [SSC Fcli Actions](#ssc-fcli-actions) section below for more details. |
| TOOL_DEFINITIONS | Fortify tool definitions are used by this GitHub Action to determine available versions, download location and other details of various Fortify-related tools, as required for action execution. By default, the Fortify-provided tool definitions hosted at https://github.com/fortify/tool-definitions/releases/tag/v1 will be used.<br/><br/>This environment variable allows for overriding the default tool definitions, pointing to either a URL or local (workspace) file. For example, if GitHub workflows are not allowed to download tools from their public internet locations, customers may host the tool installation bundles on an internal server, together with a customized tool definitions bundle that lists the alternative download URLs. |


<!-- START-INCLUDE:action/generic/ssc/ssc-fcli-actions.md -->

### SSC Fcli Actions

<!-- Note that similar instructions are provided for FoD in fod-fcli-actions.md; when updating these instructions, fod-fcli-actions.md will likely need to be updated accordingly -->


<!-- START-INCLUDE:action/generic/fcli-actions.md -->

As indicated in the [Action environment variable inputs](#action-environment-variable-inputs) section above, this GitHub Action utilizes one or more fcli actions to perform certain activities. These fcli-provided actions are used as building blocks that can be re-used across different CI/CD platforms to provide consistent behavior across those platforms. This GitHub Action also provides the ability to override the default built-in fcli actions with custom fcli actions, allowing for rich customization capabilities. For example, such custom fcli actions could define different default values for some action options, perform some additional activities, and/or provide fully customized behavior.

For more information on fcli actions and custom action development, please see the [fcli action documentation](https://fortify.github.io/fcli/v2.9.1/#_actions). Such custom actions may be hosted either on the local file system (for example stored in your source code repository) or some remote location; the `*_ACTION` environment variables may point to either a local file or URL. To easily share custom actions across multiple pipelines, you may want to consider hosting these in a dedicated source code repository that's accessible by all pipelines. This provides an easy hosting location, and allows for easy maintenance of such custom actions.

<!-- END-INCLUDE:action/generic/fcli-actions.md -->


When developing custom actions, please note that the GitHub Action expects certain action parameters to be supported by such a custom action. A common example is the `--av` / `--appversion` command-line option, which the GitHub Action will automatically pass to most or all fcli actions to specify the SSC application version to operate on. What command-line options are automatically passed to the fcli action may also depend on GitHub Action configuration. If the custom action doesn't support those action parameters, the action invocation will fail. You will also need to consider any options explicitly configured through the `*_EXTRA_OPTS` environment variable; for backward compatibility with existing GitHub Action workflows that have been configured with some extra action options, you should be careful with removing or renaming any action parameters.

Future versions of this documentation may provide more details on what command-line options are automatically passed to fcli actions. Until then, you'll need to review workflow logs and/or GitHub Action source code to identify what action parameters are being automatically passed by the GitHub Action. Alternatively, you may want to consider simply duplicating all action parameters from the fcli built-in action, even if some of those parameters will not be used by your custom action.

<!-- END-INCLUDE:action/generic/ssc/ssc-fcli-actions.md -->


<!-- END-INCLUDE:action/ssc-export/readme.md -->



<!-- START-INCLUDE:h2.support.md -->

## Support

The only warranties for products and services of Open Text and its affiliates and licensors (“Open Text”) are as may be set forth in the express warranty statements accompanying such products and services. Nothing herein should be construed as constituting an additional warranty. Open Text shall not be liable for technical or editorial errors or omissions contained herein. The information contained herein is subject to change without notice.

The software is provided "as is" and is not supported through the regular OpenText Support channels. Support requests may be submitted through the [GitHub Issues](https://github.com/fortify/github-action/issues) page for this repository. A (free) GitHub account is required to submit new issues or to comment on existing issues. 

Support requests created through the GitHub Issues page may include bug reports, enhancement requests and general usage questions. Please avoid creating duplicate issues by checking whether there is any existing issue, either open or closed, that already addresses your question, bug or enhancement request. If an issue already exists, please add a comment to provide additional details if applicable.

Support requests on the GitHub Issues page are handled on a best-effort basis; there is no guaranteed response time, no guarantee that reported bugs will be fixed, and no guarantee that enhancement requests will be implemented. If you require dedicated support for this and other Fortify software, please consider purchasing OpenText Fortify Professional Services. OpenText Fortify Professional Services can assist with general usage questions, integration of the software into your processes, and implementing customizations, bug fixes, and feature requests (subject to feasibility analysis). Please contact your OpenText Sales representative or fill in the [Professional Services Contact Form](https://www.microfocus.com/en-us/cyberres/contact/professional-services) to obtain more information on pricing and the services that OpenText Fortify Professional Services can provide.

<!-- END-INCLUDE:h2.support.md -->


---

*[This document was auto-generated; do not edit by hand](https://github.com/fortify/shared-doc-resources/blob/main/USAGE.md)*
