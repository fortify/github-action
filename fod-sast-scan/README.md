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


<!-- START-INCLUDE:action-prerequisites.md -->

### Prerequisites

This action assumes the standard software packages as provided by GitHub-hosted runners to be available. If you are using self-hosted runners, you may need to install some of these software packages in order to successfully use this action. In particular, not having the following software installed is known to cause issues when running `fortify/github-action` or one of its sub-actions:

* Node.js
* Visual C++ Redistributable (Windows-based runners only)
* Bash shell   
  If using Windows runners, this must be a Windows-based `bash` variant, for example as provided by MSYS2. You must make sure that this Windows-based `bash` variant is used for `run` steps that specify `shell: bash`. Actions will fail if the GitHub runner executes `bash` commands on the WSL-provided `bash.exe`

<!-- END-INCLUDE:action-prerequisites.md -->


Apart from the generic action prerequisites listed above, the following prerequisites apply to this specific action:

* The appropriate application release exists on FoD and has been configured for SAST scans. Future versions of this action may add support for automating app/release creation and scan setup.
* If open source scanning has been enabled in the FoD SAST scan configuration, be sure to pass the `-oss` option through the `PACKAGE_EXTRA_OPTS` environment variable.

### Action environment variable inputs


<!-- START-INCLUDE:env-fod-sast-scan.md -->



<!-- START-INCLUDE:env-fod-login.md -->


<!-- START-INCLUDE:env-fod-connection.md -->

**`FOD_URL`** - REQUIRED   
Fortify on Demand URL, for example https://ams.fortify.com. Note: Using GitHub Secrets to define this URL may cause links back to FoD to be rendered incorrectly, for example in GitHub Action workflow summaries. It is highly recommended to either hard-code the URL in your workflow, or to use [GitHub Variables](https://docs.github.com/en/actions/writing-workflows/choosing-what-your-workflow-does/store-information-in-variables)  instead of GitHub Secrets. 

**`FOD_CLIENT_ID` & `FOD_CLIENT_SECRET`** - REQUIRED*    
Required when authenticating with an API key: FoD Client ID (API key) and Secret (API secret).

**`FOD_TENANT`, `FOD_USER` & `FOD_PASSWORD`** - REQUIRED*    
Required when authenticating with user credentials: FoD tenant, user and password. It's recommended to use a Personal Access Token instead of an actual user password.

<!-- END-INCLUDE:env-fod-connection.md -->


**`EXTRA_FOD_LOGIN_OPTS` (deprecated), `FOD_LOGIN_EXTRA_OPTS`** - OPTIONAL   
Extra FoD login options, for example for disabling SSL checks or changing connection time-outs; see [`fcli fod session login` documentation](https://fortify.github.io/fcli/v2.8.0//manpage/fcli-fod-session-login.html)

<!-- END-INCLUDE:env-fod-login.md -->



<!-- START-INCLUDE:env-fod-release.md -->

**`FOD_RELEASE`** - OPTIONAL    
Fortify on Demand release to use with this action. This can be specified either as a numeric release id, `<app-name>:<release-name>` (for non-microservices applications) or `<app-name>:<microservice-name>:<release-name>` (for microservices applications). Default value is [`<github.repository>:<github.head_ref || github.ref_name>`](https://docs.github.com/en/actions/learn-github-actions/contexts#github-context), for example `myOrg/myRepo:myBranch`. Note that you'll need to explicitly configure `FOD_RELEASE` for microservices applications, as the default value lacks a microservice name.

<!-- END-INCLUDE:env-fod-release.md -->



<!-- START-INCLUDE:env-do-setup.md -->

**`DO_SETUP`, `SETUP_ACTION`, `SETUP_EXTRA_OPTS`** - OPTIONAL    
If `DO_SETUP` is set to `true` (implied if any of the other two `SETUP_*` variables are set), this action will set up the FoD release / SSC application version, creating those if they do not yet exist, using the fcli-provided [FoD `setup-release`](https://fortify.github.io/fcli/v2.8.0/fod-actions.html#_setup_release)  or [SSC `setup-appversion`](https://fortify.github.io/fcli/v2.8.0/ssc-actions.html#_setup_appversion) action, or, if specified, the custom fcli action specified through `SETUP_ACTION`. `SETUP_ACTION` may point to a local file or URL; this custom fcli action must support (at least) the exact same action parameters (including any environment variable based default values for those parameters) as the built-in fcli action. Any extra options for the fcli action can be passed through the `SETUP_EXTRA_OPTS` environment variable, for example to copy from an existing release/application version, or to allow an unsigned custom action to be used.

Note that if setup is enabled, `FOD_RELEASE` or `SSC_APPVERSION` must be configured with a qualified release/version name; you cannot use release/version id.

<!-- END-INCLUDE:env-do-setup.md -->



<!-- START-INCLUDE:env-fod-package.md -->

**`EXTRA_PACKAGE_OPTS` (deprecated), `PACKAGE_EXTRA_OPTS`** - OPTIONAL     
By default, this action runs `scancentral package -o package.zip` to package application source code. The `PACKAGE_EXTRA_OPTS` environment variable can be used to specify additional packaging options. 

If FoD Software Composition Analysis has been purchased and configured on the applicable release, you'll need to pass the `-oss` option through this environment variable to generate and package the additional dependency files required. 

Based on the  automated build tool detection feature provided by ScanCentral Client, this default `scancentral` command is often sufficient to properly package application source code. Depending on your build setup, you may however need to configure the `PACKAGE_EXTRA_OPTS` environment variable to specify additional packaging options. 

As an example, if the build file that you want to use for packaging doesn't adhere  to common naming conventions, you can configure the `-bf <custom build file>` option using the `PACKAGE_EXTRA_OPTS` environment variable. See [Command-line options for the package command](https://www.microfocus.com/documentation/fortify-software-security-center/2420/SC_SAST_Help_24.2.0/index.htm#cli/package-cmd.htm) for more information on available options.

<!-- END-INCLUDE:env-fod-package.md -->


**`EXTRA_FOD_SAST_SCAN_OPTS` (deprecated), `FOD_SAST_SCAN_EXTRA_OPTS`** - OPTIONAL    
Extra FoD SAST scan options; see [`fcli fod sast-scan start` documentation](https://fortify.github.io/fcli/v2.8.0//manpage/fcli-fod-sast-scan-start.html)


<!-- START-INCLUDE:env-do-wait.md -->

**`DO_WAIT`** - OPTIONAL    
By default, this action will not wait until scans have been completed. To have the workflow wait until all scans have been completed, set the `DO_WAIT` environment variable to `true`. Note that some other environment variables imply `DO_WAIT`, for example when exporting vulnerability data or generating job summaries. This behavior is documented in the applicable environment variable descriptions.

<!-- END-INCLUDE:env-do-wait.md -->



<!-- START-INCLUDE:env-do-policy-check.md -->

**`DO_POLICY_CHECK`, `CHECK_POLICY_ACTION`, `CHECK_POLICY_EXTRA_OPTS`** - OPTIONAL    
If `DO_POLICY_CHECK` is set to `true` (implied if any of the other two `CHECK_POLICY_*` variables are set, and implies `DO_WAIT`), a policy check will be run after scan completion using the fcli-provided [FoD `check-policy`](https://fortify.github.io/fcli/v2.8.0/fod-actions.html#_check_policy) or [SSC `check-policy`](https://fortify.github.io/fcli/v2.8.0/ssc-actions.html#_check_policy) action or, if specified, the custom fcli action specified through `CHECK_POLICY_ACTION`. `POLICY_CHECK_ACTION` may point to a local file or URL; this custom fcli action must accept at least the `--av` (for SSC) or `--rel` (for FoD) option. Any extra options for this custom fcli action can be passed through the `CHECK_POLICY_EXTRA_OPTS` environment variable, which may include fcli options to allow unsigned custom actions to be used. Note that for FoD, the fcli-provided `check-policy` action will check the outcome of the FoD security policy. As SSC doesn't provide any similar security policy features, the fcli-provided action executes some sample policy checks that will likely fail in many cases. As security policies are different for every Fortify customer, you should consider implementing your own custom fcli policy check action(s), unless FoD-provided security policy functionality is sufficient.

<!-- END-INCLUDE:env-do-policy-check.md -->



<!-- START-INCLUDE:env-do-job-summary.md -->

**`DO_JOB_SUMMARY`, `JOB_SUMMARY_ACTION`, `JOB_SUMMARY_EXTRA_OPTS`** - OPTIONAL    
If `DO_JOB_SUMMARY` is set to `true` (implied if any of the other two `JOB_SUMMARY_*` variables are set, and implies `DO_WAIT`), this action will generate a job summary listing scan status and issue counts using the fcli-provided [FoD `release-summary`](https://fortify.github.io/fcli/v2.8.0/fod-actions.html#_release_summary) or [SSC `appversion-summary`](https://fortify.github.io/fcli/v2.8.0/ssc-actions.html#_appversion_summary) action, or, if specified, the custom fcli action specified through `JOB_SUMMARY_ACTION`. `JOB_SUMMARY_ACTION` may point to a local file or URL; this custom fcli action must support (at least) the exact same action parameters (including any environment variable based default values for those parameters) as the built-in fcli action. Any extra options for the fcli action can be passed through the `JOB_SUMMARY_EXTRA_OPTS` environment variable, for example to specify the SSC filter sets to be included in the summary, or to allow an unsigned custom action to be used.

<!-- END-INCLUDE:env-do-job-summary.md -->



<!-- START-INCLUDE:env-do-export.md -->

**`DO_EXPORT`, `EXPORT_ACTION`, `EXPORT_EXTRA_OPTS`** - OPTIONAL    
If `DO_EXPORT` is set to `true` (implied if any of the other two `EXPORT_*` variables are set, and implies `DO_WAIT`) or when explicitly invoking the `fortify/github-action/fod-export` or `fortify/github-action/ssc-export` actions, this action will will export scan results to the GitHub Security Code Scanning dashboard using the fcli-provided [FoD `github-sast-report`](https://fortify.github.io/fcli/v2.8.0/fod-actions.html#_github_sast_report) or [SSC `github-sast-action`](https://fortify.github.io/fcli/v2.8.0/ssc-actions.html#_github_sast_report) action or, if specified, the custom fcli action specified through `EXPORT_ACTION`.  `EXPORT_ACTION` may point to a local file or URL; this custom fcli action must support (at least) the exact same action parameters (including any environment variable based default values for those parameters) as the built-in fcli action. Any extra options for the fcli action can be passed through the `EXPORT_EXTRA_OPTS` environment variable, for example to specify the SSC filter set from which to load issue data, or to allow an unsigned custom action to be used.

Note that this may require a [GitHub Advanced Security](https://docs.github.com/en/get-started/learning-about-github/about-github-advanced-security) subscription, unless you're running this action on a public github.com repository. GitHub only supports importing SAST results; other results will not exported to GitHub.

<!-- END-INCLUDE:env-do-export.md -->



<!-- START-INCLUDE:env-do-pr-comment.md -->

**`DO_PR_COMMENT`, `PR_COMMENT_ACTION`, `PR_COMMENT_EXTRA_OPTS`** - OPTIONAL *(PREVIEW)*    
If `DO_PR_COMMENT` is set to `true` (implied if any of the other two `PR_COMMENT_*` variables are set, and implies `DO_WAIT`), this action will generate a pull request comment listing new, re-introduced and removed issues using the fcli-provided [FoD `github-pr-comment`](https://fortify.github.io/fcli/v2.8.0/fod-actions.html#_github_pr_comment) or [SSC `github-pr-comment`](https://fortify.github.io/fcli/v2.8.0/ssc-actions.html#_github_pr_comment) action or, if specified, the custom fcli action specified through `PR_COMMENT_ACTION`. `PR_COMMENT_ACTION` may point to a local file or URL; this custom fcli action must support (at least) the exact same action parameters (including any environment variable based default values for those parameters) as the built-in fcli action. Any extra options for the fcli action can be passed through the `PR_COMMENT_EXTRA_OPTS` environment variable, for example to specify the SSC filter set from which to load issue data, or to allow an unsigned custom action to be used.

Note that pull request comments will only be generated under the following conditions:

* Standard `GITHUB_REF_NAME` environment variable points to a pull request, which is only the case on GitHub `pull_request` triggers and not for example `manual` triggers (even if the branch is associated with a current pull request).
* All other standard GitHub environment variables like `GITHUB_TOKEN`, `GITHUB_REPOSITORY` and `GITHUB_SHA` are set.

PR comments are generated by comparing scan results from the current GitHub Action run against the previous scan in the same application version/release; it won't detect any new/removed issues from older scans. For best results, you should configure your workflow as follows:

- For any branches for which you might want to generate PR comments, have the workflow trigger only on `pull_request` events. Note that you can have a single workflow that is triggered on both `push` events for your main branch, and only `pull_request` events for all other branches.
- Don't set `FOD_RELEASE` or `SSC_APPVERSION`, to use the default value that corresponds to repository and branch name.
- Set `DO_RELEASE_SETUP` or `DO_APPVERSION_SETUP` to `true`, to allow a branch-specific application version/release to be automatically created.
- Include `--copy-from` option in `RELEASE_SETUP_EXTRA_OPTS` or `APPVERSION_SETUP_EXTRA_OPTS` to copy state from the version/release that represents the PR target branch into the newly created application version/release.

With a setup like this, whenever a new PR is created, the GitHub Action will:
- Create a new application version/release named `<repository owner>/<repository name>:<branch name>`.
- Copy state from the application version/release identified by the `--copy-from` option to this new application version/release.
- Run a new scan of the branch associated with the current PR, and upload results to the application version/release created above.
- Generate a PR comment listing new and removed issues, based on comparing the results of the new scan that was run in the previous step against the scan results that were copied from the version/release identified by the `--copy-from` option.

If any subsequent updates are pushed to the PR and the workflow is also being triggered on PR update events, the GitHub Action will run a new scan of the branch associated with the PR, publish results to the existing branch-specific application version/release, and generate a new PR comment that shows any new/removed issues in the new scan compared to the previous scan for the same branch/PR.

<!-- END-INCLUDE:env-do-pr-comment.md -->


<!-- END-INCLUDE:env-fod-sast-scan.md -->



<!-- START-INCLUDE:env-setup.md -->

**`TOOL_DEFINITIONS`** - OPTIONAL   
Fortify tool definitions are used by this GitHub Action to determine available versions, download location and other details of various Fortify-related tools, as required for action execution. By default, the Fortify-provided tool definitions hosted at https://github.com/fortify/tool-definitions/releases/tag/v1 will be used. 

This environment variable allows for overriding the default tool definitions, pointing to either a URL or local (workspace) file. For example, if GitHub workflows are not allowed to download tools from their public internet locations, customers may host the tool installation bundles on an internal server, together with a customized tool definitions bundle that lists the alternative download URLs.

<!-- END-INCLUDE:env-setup.md -->


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
          # FOD_LOGIN_EXTRA_OPTS: --socket-timeout=60s
          # FOD_RELEASE: MyApp:MyRelease
          # PACKAGE_EXTRA_OPTS: -oss
          # DO_WAIT: true
          # DO_EXPORT: true
          # TOOL_DEFINITIONS: https://ftfy.mycompany.com/tool-definitions/v1/tool-definitions.yaml.zip
```

<!-- END-INCLUDE:action-fod-sast-scan.md -->



<!-- START-INCLUDE:h2.support.md -->

## Support

The only warranties for products and services of Open Text and its affiliates and licensors (“Open Text”) are as may be set forth in the express warranty statements accompanying such products and services. Nothing herein should be construed as constituting an additional warranty. Open Text shall not be liable for technical or editorial errors or omissions contained herein. The information contained herein is subject to change without notice.

The software is provided "as is" and is not supported through the regular OpenText Support channels. Support requests may be submitted through the [GitHub Issues](https://github.com/fortify/github-action/issues) page for this repository. A (free) GitHub account is required to submit new issues or to comment on existing issues. 

Support requests created through the GitHub Issues page may include bug reports, enhancement requests and general usage questions. Please avoid creating duplicate issues by checking whether there is any existing issue, either open or closed, that already addresses your question, bug or enhancement request. If an issue already exists, please add a comment to provide additional details if applicable.

Support requests on the GitHub Issues page are handled on a best-effort basis; there is no guaranteed response time, no guarantee that reported bugs will be fixed, and no guarantee that enhancement requests will be implemented. If you require dedicated support for this and other Fortify software, please consider purchasing OpenText Fortify Professional Services. OpenText Fortify Professional Services can assist with general usage questions, integration of the software into your processes, and implementing customizations, bug fixes, and feature requests (subject to feasibility analysis). Please contact your OpenText Sales representative or fill in the [Professional Services Contact Form](https://www.microfocus.com/en-us/cyberres/contact/professional-services) to obtain more information on pricing and the services that OpenText Fortify Professional Services can provide.

<!-- END-INCLUDE:h2.support.md -->


---

*[This document was auto-generated; do not edit by hand](https://github.com/fortify/shared-doc-resources/blob/main/USAGE.md)*
