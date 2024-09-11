# fortify/github-action/sc-sast-scan@v1 


<!-- START-INCLUDE:p.marketing-intro.md -->

[Fortify Application Security](https://www.microfocus.com/en-us/solutions/application-security) provides your team with solutions to empower [DevSecOps](https://www.microfocus.com/en-us/cyberres/use-cases/devsecops) practices, enable [cloud transformation](https://www.microfocus.com/en-us/cyberres/use-cases/cloud-transformation), and secure your [software supply chain](https://www.microfocus.com/en-us/cyberres/use-cases/securing-the-software-supply-chain). As the sole Code Security solution with over two decades of expertise and acknowledged as a market leader by all major analysts, Fortify delivers the most adaptable, precise, and scalable AppSec platform available, supporting the breadth of tech you use and integrated into your preferred toolchain. We firmly believe that your great code [demands great security](https://www.microfocus.com/cyberres/application-security/developer-security), and with Fortify, go beyond 'check the box' security to achieve that.

<!-- END-INCLUDE:p.marketing-intro.md -->



<!-- START-INCLUDE:action-sc-sast-scan.md -->

This action performs a SAST scan on ScanCentral SAST, consisting of the following steps:

* Login to ScanCentral SAST Controller
* Package application source code using ScanCentral Client
* Submit the source code package to be scanned to ScanCentral SAST Controller
* Optionally run a Debricked Software Composition Analysis scan
* Optionally wait for all scans to complete and results having been processed by SSC
* Optionally export scan results to the GitHub Code Scanning dashboard


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
* If Debricked scanning is enabled, the [Fortify SSC Parser Plugin for Debricked results](https://github.com/fortify/fortify-ssc-parser-debricked-cyclonedx) must be installed on Fortify SSC, to allow for SSC to accept and process the Debricked scan results submitted by this action.

### Action environment variable inputs


<!-- START-INCLUDE:env-sc-sast-scan.md -->


<!-- START-INCLUDE:env-ssc-connection.md -->

**`SSC_URL`** - REQUIRED   
Fortify Software Security Center URL, for example https://ssc.customer.fortifyhosted.net/. Note: Using GitHub Secrets to define this URL may cause links back to SSC to be rendered incorrectly, for example in GitHub Action workflow summaries. It is highly recommended to either hard-code the URL in your workflow, or to use [GitHub Variables](https://docs.github.com/en/actions/writing-workflows/choosing-what-your-workflow-does/store-information-in-variables) instead of GitHub Secrets.

**`SSC_TOKEN`** - REQUIRED*   
Required when authenticating with an SSC token (recommended). Most actions should work fine with a `CIToken`.

**`SSC_USER` & `SSC_PASSWORD`** - REQUIRED*   
Required when authenticating with SSC user credentials.

<!-- END-INCLUDE:env-ssc-connection.md -->



<!-- START-INCLUDE:env-ssc-login.md -->

**`EXTRA_SSC_LOGIN_OPTS`** - OPTIONAL    
Extra SSC login options, for example for disabling SSL checks or changing connection time-outs; see [`fcli ssc session login` documentation](https://fortify.github.io/fcli/v2.5.2//manpage/fcli-ssc-session-login.html).

<!-- END-INCLUDE:env-ssc-login.md -->



<!-- START-INCLUDE:env-sc-sast-login.md -->

**`SC_SAST_TOKEN`** - REQUIRED    
Required: ScanCentral SAST Client Authentication Token for authenticating with ScanCentral SAST Controller.

**`EXTRA_SC_SAST_LOGIN_OPTS`** - OPTIONAL    
Extra ScanCentral SAST login options, for example for disabling SSL checks or changing connection time-outs; see [`fcli sc-sast session login` documentation](https://fortify.github.io/fcli/v2.5.2//manpage/fcli-sc-sast-session-login.html).

<!-- END-INCLUDE:env-sc-sast-login.md -->


**`DO_DEBRICKED_SCAN`** - OPTIONAL    
If set to `true`, this action will run both ScanCentral SAST and Debricked Software Composition Analysis (SCA) scans and publish both results to SSC. This is equivalent to setting the `debricked-sca-scan` input on the top-level `fortify/github-action` action. Note that this requires the [Fortify SSC Parser Plugin for Debricked results](https://github.com/fortify/fortify-ssc-parser-debricked-cyclonedx) to be installed on Fortify SSC, to allow for SSC to accept and process the Debricked scan results submitted by this action.

**`DEBRICKED_TOKEN`** - REQUIRED*       
Required when performing a Debricked Software Composition Analysis scan; see the [Generate access token](https://docs.debricked.com/product/administration/generate-access-token) section in the Debricked documentation for details on how to generate this token.


<!-- START-INCLUDE:env-ssc-appversion.md -->

**`SSC_APPVERSION`** - OPTIONAL   
Fortify SSC application version to use with this action. This can be specified either as a numeric application version id, or by providing application and version name in the format `<app-name>:<version-name>`. Default value is [`<github.repository>:<github.head_ref || github.ref_name>`](https://docs.github.com/en/actions/learn-github-actions/contexts#github-context), for example `myOrg/myRepo:myBranch`.

<!-- END-INCLUDE:env-ssc-appversion.md -->



<!-- START-INCLUDE:env-package.md -->

**`EXTRA_PACKAGE_OPTS`** - OPTIONAL   
By default, this action runs `scancentral package -o package.zip` to package application source code. Based on the  automated build tool detection feature provided by ScanCentral Client, this default `scancentral` command is often sufficient. Depending on your build setup, you may however need to configure the `EXTRA_PACKAGE_OPTS` environment variable to specify additional packaging options. 

As an example, if the build file that you want to use for packaging doesn't adhere  to common naming conventions, you can configure the `-bf <custom build file>` option using the `EXTRA_PACKAGE_OPTS` environment variable. See [Command-line options for the package command]({{var:sc-client-doc-base-url#CLI.htm#Package}}) for more information on available options.

<!-- END-INCLUDE:env-package.md -->


**`SC_SAST_SENSOR_VERSION`** - REQUIRED     
Version of the ScanCentral SAST sensor on which the scan should be performed. See [`fcli sc-sast scan start` documentation](https://fortify.github.io/fcli/v2.5.2//manpage/fcli-sc-sast-scan-start.html#_options_for_scanning_a_package_file) for details.

**`EXTRA_SC_SAST_SCAN_OPTS`** - OPTIONAL    
Extra ScanCentral SAST scan options; see [`fcli sc-sast scan start` documentation](https://fortify.github.io/fcli/v2.5.2//manpage/fcli-sc-sast-scan-start.html)


<!-- START-INCLUDE:env-do-job-summary.md -->

**`DO_JOB_SUMMARY`, `JOB_SUMMARY_ACTION`, `JOB_SUMMARY_EXTRA_OPTS`** - OPTIONAL    
If `DO_JOB_SUMMARY` is set to `true` (which implies `DO_WAIT`), this action will generate a job summary listing scan status and issue counts using the fcli-provided `release-summary` (FoD) or `appversion-summary` (SSC) action, or, if specified, the custom fcli action specified through `JOB_SUMMARY_ACTION`. `JOB_SUMMARY_ACTION` may point to a local file or URL; this custom fcli action must support (at least) the exact same action parameters (including any environment variable based default values for those parameters) as the built-in fcli action. Any extra options for the fcli action can be passed through the `JOB_SUMMARY_EXTRA_OPTS` environment variable, for example to specify the SSC filter sets to be included in the summary, or to allow an unsigned custom action to be used. Please see https://fortify.github.io/fcli/v2.5.2/#_actions for more information. 

<!-- END-INCLUDE:env-do-job-summary.md -->



<!-- START-INCLUDE:env-do-export.md -->

**`DO_EXPORT`, `EXPORT_ACTION`, `EXPORT_EXTRA_OPTS`** - OPTIONAL    
If `DO_EXPORT` is set to `true` (which implies `DO_WAIT`) or when explicitly invoking the `fortify/github-action/fod-export` or `fortify/github-action/ssc-export` actions, this action will will export scan results to the GitHub Security Code Scanning dashboard using the fcli-provided `github-sast-report` action or, if specified, the custom fcli action specified through `EXPORT_ACTION`.  `EXPORT_ACTION` may point to a local file or URL; this custom fcli action must support (at least) the exact same action parameters (including any environment variable based default values for those parameters) as the built-in fcli action. Any extra options for the fcli action can be passed through the `EXPORT_EXTRA_OPTS` environment variable, for example to specify the SSC filter set from which to load issue data, or to allow an unsigned custom action to be used. Please see https://fortify.github.io/fcli/v2.5.2/#_actions for more information. 

Note that this may require a [GitHub Advanced Security](https://docs.github.com/en/get-started/learning-about-github/about-github-advanced-security) subscription, unless you're running this action on a public github.com repository. GitHub only supports importing SAST results; other results will not exported to GitHub.

<!-- END-INCLUDE:env-do-export.md -->



<!-- START-INCLUDE:env-do-pr-comment.md -->

**`DO_PR_COMMENT`, `PR_COMMENT_ACTION`, `PR_COMMENT_EXTRA_OPTS`** - OPTIONAL    
If `DO_PR_COMMENT` is set to `true` (which implies `DO_WAIT`), this action will generate a pull request comment listing new, re-introduced and removed issues using the fcli-provided `github-pr-comment` action or, if specified, the custom fcli action specified through `PR_COMMENT_ACTION`. `PR_COMMENT_ACTION` may point to a local file or URL; this custom fcli action must support (at least) the exact same action parameters (including any environment variable based default values for those parameters) as the built-in fcli action. Any extra options for the fcli action can be passed through the `PR_COMMENT_EXTRA_OPTS` environment variable, for example to specify the SSC filter set from which to load issue data, or to allow an unsigned custom action to be used. Please see https://fortify.github.io/fcli/v2.5.2/#_actions for more information. 

Note that pull request comments will only be generated under the following conditions:

* `GITHUB_TOKEN` environment variable needs to be set to a valid GitHub token, for example from `{{ secrets.GITHUB_TOKEN }}`.
* Standard `GITHUB_REF_NAME` environment variable points to a pull request.
* All other standard GitHub environment variables like `GITHUB_REPOSITORY` and `GITHUB_SHA` are set.

PR comments are generated by comparing scan results from the current GitHub Action run against the previous scan in the same application version/release; it won't detect any new/removed issues from older scans. For best results, you should configure the GitHub Action to run only on pull request creation (not on every commit) and optionally allow for manual runs (if you want to re-run the scan after a PR is updated). You should also configure the action to automatically create a dedicated application version/release for the current branch/PR, copying state from the main/parent branch version/release. This will allow the action to compare scan results for the current GitHub Action run against the last scan results of the main/parent branch.

<!-- END-INCLUDE:env-do-pr-comment.md -->



<!-- START-INCLUDE:env-do-wait.md -->

**`DO_WAIT`** - OPTIONAL    
By default, this action will not wait until scans have been completed. To have the workflow wait until all scans have been completed, set the `DO_WAIT` environment variable to `true`. Note that some other environment variables imply `DO_WAIT`, for example when exporting vulnerability data or generating workflow summaries. This behavior is documented in the applicable environment variable descriptions.

<!-- END-INCLUDE:env-do-wait.md -->


<!-- END-INCLUDE:env-sc-sast-scan.md -->



<!-- START-INCLUDE:env-setup.md -->

**`TOOL_DEFINITIONS`** - OPTIONAL   
Fortify tool definitions are used by this GitHub Action to determine available versions, download location and other details of various Fortify-related tools, as required for action execution. By default, the Fortify-provided tool definitions hosted at https://github.com/fortify/tool-definitions/releases/tag/v1 will be used. 

This environment variable allows for overriding the default tool definitions, pointing to either a URL or local (workspace) file. For example, if GitHub workflows are not allowed to download tools from their public internet locations, customers may host the tool installation bundles on an internal server, together with a customized tool definitions bundle that lists the alternative download URLs.

<!-- END-INCLUDE:env-setup.md -->


### Sample usage

The sample workflow below demonstrates how to configure the action for running a SAST scan on ScanCentral SAST.

```yaml
    steps:    
      - name: Check out source code
        uses: actions/checkout@v4  
      - name: Run ScanCentral SAST Scan
        uses: fortify/github-action/sc-sast-scan@v1
        env:
          SSC_URL: ${{vars.SSC_URL}}
          SSC_TOKEN: ${{secrets.SSC_TOKEN}}
          # EXTRA_SSC_LOGIN_OPTS: --socket-timeout=60s
          SC_SAST_TOKEN: ${{secrets.CLIENT_AUTH_TOKEN}}
          # EXTRA_SC_SAST_LOGIN_OPTS: --socket-timeout=60s
          # SSC_APPVERSION: MyApp:MyVersion
          # EXTRA_PACKAGE_OPTS: -bf custom-pom.xml
          SC_SAST_SENSOR_VERSION: 23.2
          # DO_DEBRICKED_SCAN: true  # Or debricked-sca-scan input on top-level action
          # DEBRICKED_TOKEN: ${{secrets.DEBRICKED_TOKEN}}
          # DO_WAIT: true
          # DO_EXPORT: true
          # TOOL_DEFINITIONS: https://ftfy.mycompany.com/tool-definitions/v1/tool-definitions.yaml.zip
```

<!-- END-INCLUDE:action-sc-sast-scan.md -->



<!-- START-INCLUDE:h2.support.md -->

## Support

The only warranties for products and services of Open Text and its affiliates and licensors (“Open Text”) are as may be set forth in the express warranty statements accompanying such products and services. Nothing herein should be construed as constituting an additional warranty. Open Text shall not be liable for technical or editorial errors or omissions contained herein. The information contained herein is subject to change without notice.

The software is provided "as is" and is not supported through the regular OpenText Support channels. Support requests may be submitted through the [GitHub Issues](https://github.com/fortify/github-action/issues) page for this repository. A (free) GitHub account is required to submit new issues or to comment on existing issues. 

Support requests created through the GitHub Issues page may include bug reports, enhancement requests and general usage questions. Please avoid creating duplicate issues by checking whether there is any existing issue, either open or closed, that already addresses your question, bug or enhancement request. If an issue already exists, please add a comment to provide additional details if applicable.

Support requests on the GitHub Issues page are handled on a best-effort basis; there is no guaranteed response time, no guarantee that reported bugs will be fixed, and no guarantee that enhancement requests will be implemented. If you require dedicated support for this and other Fortify software, please consider purchasing OpenText Fortify Professional Services. OpenText Fortify Professional Services can assist with general usage questions, integration of the software into your processes, and implementing customizations, bug fixes, and feature requests (subject to feasibility analysis). Please contact your OpenText Sales representative or fill in the [Professional Services Contact Form](https://www.microfocus.com/en-us/cyberres/contact/professional-services) to obtain more information on pricing and the services that OpenText Fortify Professional Services can provide.

<!-- END-INCLUDE:h2.support.md -->


---

*[This document was auto-generated; do not edit by hand](https://github.com/fortify/shared-doc-resources/blob/main/USAGE.md)*
