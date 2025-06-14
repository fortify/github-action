# fortify/github-action@v2 


<!-- START-INCLUDE:p.marketing-intro.md -->

[Fortify Application Security](https://www.microfocus.com/en-us/solutions/application-security) provides your team with solutions to empower [DevSecOps](https://www.microfocus.com/en-us/cyberres/use-cases/devsecops) practices, enable [cloud transformation](https://www.microfocus.com/en-us/cyberres/use-cases/cloud-transformation), and secure your [software supply chain](https://www.microfocus.com/en-us/cyberres/use-cases/securing-the-software-supply-chain). As the sole Code Security solution with over two decades of expertise and acknowledged as a market leader by all major analysts, Fortify delivers the most adaptable, precise, and scalable AppSec platform available, supporting the breadth of tech you use and integrated into your preferred toolchain. We firmly believe that your great code [demands great security](https://www.microfocus.com/cyberres/application-security/developer-security), and with Fortify, go beyond 'check the box' security to achieve that.

<!-- END-INCLUDE:p.marketing-intro.md -->



<!-- START-INCLUDE:action/_root/readme.md -->

This GitHub Action allows for easy integration of Fortify Application Security Testing (AST) into your GitHub Action workflows. It  provides out-of-the-box support for Static Application Security Testing (SAST) and Software Composition Analysis (SCA); support for Dynamic or Mobile Application Security Testing (DAST & MAST) may be added in the future. Apart from utilizing the standard scan workflows provided by this GitHub Action, you may also choose to utilize the various building blocks to implement custom workflows, which can be either customized SAST or SCA workflows, or your own DAST or MAST workflows.

The following sections describe these topics in more detail:

* [Prerequisites](#prerequisites)
* [Application Security Testing with Fortify on Demand](#application-security-testing-with-fortify-on-demand)
* [Application Security Testing with SSC/ScanCentral](#application-security-testing-with-sscscancentral)
* [Building blocks for custom workflows](#building-blocks-for-custom-workflows)


<!-- START-INCLUDE:action/_generic/prerequisites-h2.md -->

## Prerequisites


<!-- START-INCLUDE:action/_generic/prerequisites.md -->

This action assumes the standard software packages as provided by GitHub-hosted runners to be available. If you are using self-hosted runners, you may need to install some of these software packages in order to successfully use this action. In particular, not having the following software installed is known to cause issues when running `fortify/github-action` or one of its sub-actions:

* Node.js
* Visual C++ Redistributable (Windows-based runners only)
* Bash shell   
  If using Windows runners, this must be a Windows-based `bash` variant, for example as provided by MSYS2. You must make sure that this Windows-based `bash` variant is used for `run` steps that specify `shell: bash`. Actions will fail if the GitHub runner executes `bash` commands on the WSL-provided `bash.exe`

<!-- END-INCLUDE:action/_generic/prerequisites.md -->


<!-- END-INCLUDE:action/_generic/prerequisites-h2.md -->


## Application Security Testing with Fortify on Demand

The standard workflow provided by this GitHub Action allows for running a Static scan and optional open-source scan (software composition analysis) on Fortify on Demand. The following sample snippet demonstrates how to invoke this GitHub Action from a GitHub Actions workflow:

```yaml
    steps:    
      - name: Check out source code
        uses: actions/checkout@v4  
      - name: Run Fortify on Demand SAST & SCA Scan
        uses: fortify/github-action@v2
        with:
          sast-scan: true
          debricked-sca-scan: true
        env:
          FOD_URL: https://ams.fortify.com
          FOD_TENANT: ${{secrets.FOD_TENANT}}
          FOD_USER: ${{secrets.FOD_USER}}
          FOD_PASSWORD: ${{secrets.FOD_PAT}}
          # FOD_CLIENT_ID: ${{secrets.FOD_CLIENT_ID}}
          # FOD_CLIENT_SECRET: ${{secrets.FOD_CLIENT_SECRET}}
          # FOD_LOGIN_EXTRA_OPTS: --socket-timeout=60s
          # FOD_RELEASE: MyApp:MyRelease
          # DO_SETUP: true
          # SETUP_ACTION: https://scm.my.org/shared-repos/fcli-actions/setup.yaml
          # SETUP_EXTRA_OPTS: --copy-from "${{ github.repository }}:${{ github.event.repository.default_branch }}"
          # SC_CLIENT_VERSION: 24.4.1
          # DO_PACKAGE_DEBUG: true
          # PACKAGE_EXTRA_OPTS: -oss -bt mvn
          # FOD_SAST_SCAN_EXTRA_OPTS:
          # DO_WAIT: true
          # DO_POLICY_CHECK: true
          # POLICY_CHECK_ACTION: https://scm.my.org/shared-repos/fcli-actions/check-policy.yaml
          # POLICY_CHECK_EXTRA_OPTS: --on-unsigned=ignore
          # DO_JOB_SUMMARY: true
          # JOB_SUMMARY_ACTION: https://scm.my.org/shared-repos/fcli-actions/job-summary.yaml
          # JOB_SUMMARY_EXTRA_OPTS: --on-unsigned=ignore
          # DO_PR_COMMENT: true
          # PR_COMMENT_ACTION: https://scm.my.org/shared-repos/fcli-actions/github-pr-comment.yaml
          # PR_COMMENT_EXTRA_OPTS: --on-unsigned=ignore
          # DO_EXPORT: true
          # EXPORT_ACTION: https://scm.my.org/shared-repos/fcli-actions/github-sast-report.yaml
          # EXPORT_EXTRA_OPTS: --on-unsigned=ignore
          # TOOL_DEFINITIONS: https://ftfy.mycompany.com/tool-definitions/v1/tool-definitions.yaml.zip
```

### Action inputs

This section lists the inputs that can be specified in the `with:` clause for this GitHub Action. Any inputs marked in **bold** are required.

| Action input | Description |
| :--- | :--- |
| sast&#8209;scan | If set to `true`, run a static scan. If not specified or set to `false`, the action will run neither static or open-source scan (independent of `debricked-sca-scan` setting), as open-source scans are currently only run in combination with a static scan. |
| debricked&#8209;sca&#8209;scan | Configure the static scan to also run an open-source scan. Depending on Fortify on Demand configuration, this may be either a Debricked or a Sonatype scan. Effectively, this adds dependency data to the scan payload, and enables the open-source scan setting in the Fortify on Demand scan configuration. Note that any existing scan configuration will not be updated, so if the scan has already been configured in Fortify on Demand, an open-source scan will only be performed if previously enabled in the existing scan configuration. |

### Action environment variable inputs

This section lists the environment variables that can be specified in the `env:` clause for this GitHub Action. Any environment variables marked in **bold** are required.

| Environment variable | Description |
| :--- | :--- |
| **FOD_URL** | Fortify on Demand URL, for example https://ams.fortify.com. Note: Using GitHub Secrets to define this URL may cause links back to Fortify on Demand to be rendered incorrectly, for example in GitHub Action job summaries. It is highly recommended to either hard-code the URL in your workflow, or to use [GitHub Variables](https://docs.github.com/en/actions/writing-workflows/choosing-what-your-workflow-does/store-information-in-variables) instead of GitHub Secrets. |
| **FOD_CLIENT_ID**<br>**FOD_CLIENT_SECRET** | Required when authenticating with an API key: Fortify on Demand Client ID (API key) and Secret (API secret). |
| **FOD_TENANT**<br/>**FOD_USER**<br/>**FOD_PASSWORD** | Required when authenticating with user credentials: Fortify on Demand tenant, user and password. It's recommended to use a Personal Access Token instead of an actual user password. |
| FOD_LOGIN_EXTRA_OPTS<br/>EXTRA_FOD_LOGIN_OPTS | Extra login options, for example for disabling SSL checks or changing connection time-outs; see [`fcli fod session login` documentation](https://fortify.github.io/fcli/v3.6.0//manpage/fcli-fod-session-login.html) . Note that `EXTRA_FOD_LOGIN_OPTS` is deprecated; please use `FOD_LOGIN_EXTRA_OPTS`.|
| FOD_RELEASE | Fortify on Demand release to use with this action. This can be specified either as a numeric release id, `<app-name>:<release-name>` (for non-microservices applications) or `<app-name>:<microservice-name>:<release-name>` (for microservices applications). Default value is based on repository and branch name, for example `myOrg/myRepo:myBranch`. Note that you'll need to explicitly configure `FOD_RELEASE` for microservices applications, as the default value lacks a microservice name. |
|DO_SETUP<br/>SETUP_ACTION<br/>SETUP_EXTRA_OPTS|If `DO_SETUP` is set to `true` (implied if any of the other two `SETUP_*` variables are set), the application and/or release will be automatically created if they do not yet exist and static scan settings will be configured if not configured already, using the fcli-provided [`setup-release`](https://fortify.github.io/fcli/v3.6.0/fod-actions.html#_setup_release) or, if specified, the custom fcli action specified through `SETUP_ACTION`. Extra options for the fcli action can be passed through the `SETUP_EXTRA_OPTS` environment variable. Depending on your Git workflow, it is recommended to have each newly created release copy state from the release representing your default branch by passing `--copy-from "${{ github.repository }}:${{ github.event.repository.default_branch }}"` through `SETUP_EXTRA_OPTS`. To allow the GitHub Action to create new applications, you must (also) provide the `--app-owner <user>` option through `SETUP_EXTRA_OPTS` if authenticating with client credentials. Note that if setup is enabled, `FOD_RELEASE` must be configured with a qualified release name; you cannot use release id. Please see the [Fcli Actions](#fortify-on-demand-fcli-actions) section below for more details.|
| SC_CLIENT_VERSION | By default, this action uses ScanCentral Client 25.2.0 for packaging. This environment variable allows for overriding the ScanCentral Client version used for packaging. |
|DO_PACKAGE_DEBUG| If set to true, this will enable the `-debug` option on the `scancentral` command, and store both ScanCentral logs and the `package.zip` file as job artifacts.|
|PACKAGE_EXTRA_OPTS<br/>EXTRA_PACKAGE_OPTS| By default, this action runs `scancentral package -o package.zip` to package application source code. Use `PACKAGE_EXTRA_OPTS` to specify additional packaging options, for example `PACKAGE_EXTRA_OPTS: -bt mvn -bf <custom build file>`. See [Command-line options for the package command](https://www.microfocus.com/documentation/fortify-software-security-center/2520/sc-sast-ugd-html-25.2.0/index.htm#cli/package-cmd.htm) for more information on available options. Note that `EXTRA_PACKAGE_OPTS` is deprecated; please use `PACKAGE_EXTRA_OPTS`.|
|FOD_SAST_SCAN_EXTRA_OPTS<br/>EXTRA_FOD_SAST_SCAN_OPTS|Extra SAST scan options; see [`fcli fod sast-scan start` documentation](https://fortify.github.io/fcli/v3.6.0//manpage/fcli-fod-sast-scan-start.html). Note that `EXTRA_FOD_SAST_SCAN_OPTS` is deprecated; please use `FOD_SAST_SCAN_EXTRA_OPTS`.|
| DO_WAIT | By default, this action will not wait until scans have been completed. To have the workflow wait until all scans have been completed, set the `DO_WAIT` environment variable to `true`. Note that some other environment variables imply `DO_WAIT`, for example when exporting vulnerability data or generating job summaries. This behavior is documented in the applicable environment variable descriptions. |
|DO_POLICY_CHECK<br/>CHECK_POLICY_ACTION<br/>CHECK_POLICY_EXTRA_OPTS|If `DO_POLICY_CHECK` is set to `true` (implied if any of the other two `CHECK_POLICY_*` variables are set, and implies `DO_WAIT`), a policy check will be run after scan completion using the fcli-provided [`check-policy`](https://fortify.github.io/fcli/v3.6.0/fod-actions.html#_check_policy) or, if specified, the custom fcli action specified through `CHECK_POLICY_ACTION`. Extra options for a custom fcli action can be passed through the `CHECK_POLICY_EXTRA_OPTS` environment variable, which may include fcli options to allow unsigned custom actions to be used. Please see the [Fcli Actions](#fortify-on-demand-fcli-actions) section below for more details.|
|DO_JOB_SUMMARY<br/>JOB_SUMMARY_ACTION<br/>JOB_SUMMARY_EXTRA_OPTS|If `DO_JOB_SUMMARY` is set to `true` (implied if any of the other two `JOB_SUMMARY_*` variables are set, and implies `DO_WAIT`), a job summary listing scan status and issue counts will be generated using the fcli-provided [`release-summary`](https://fortify.github.io/fcli/v3.6.0/fod-actions.html#_release_summary) or, if specified, the custom fcli action specified through `JOB_SUMMARY_ACTION`. Extra options for the fcli action can be passed through the `JOB_SUMMARY_EXTRA_OPTS` environment variable, for example to allow an unsigned custom action to be used. Please see the [Fcli Actions](#fortify-on-demand-fcli-actions) section below for more details. |
| DO_EXPORT<br/>EXPORT_ACTION<br/>EXPORT_EXTRA_OPTS | If `DO_EXPORT` is set to `true` (implied if any of the other two `EXPORT_*` variables are set, and implies `DO_WAIT`), scan results will be exported to the GitHub Security Code Scanning dashboard using the fcli-provided [`github-sast-report`](https://fortify.github.io/fcli/v3.6.0/fod-actions.html#_github_sast_report) action or, if specified, the custom fcli action specified through `EXPORT_ACTION`. Extra options for the fcli action can be passed through the `EXPORT_EXTRA_OPTS` environment variable, for example to to allow an unsigned custom action to be used. Please see the [Fcli Actions](#fortify-on-demand-fcli-actions) section below for more details.<br/><br/>Note that this may require a [GitHub Advanced Security](https://docs.github.com/en/get-started/learning-about-github/about-github-advanced-security) subscription, unless you're running this action on a public github.com repository. GitHub only supports importing SAST results; other results will not exported to GitHub. |
|(PREVIEW)<br/>DO_PR_COMMENT<br/>PR_COMMENT_ACTION<br/>PR_COMMENT_EXTRA_OPTS|If `DO_PR_COMMENT` is set to `true` (implied if any of the other two `PR_COMMENT_*` variables are set, and implies `DO_WAIT`), a pull request comment listing new, re-introduced and removed issues will be generated using the fcli-provided [`github-pr-comment`](https://fortify.github.io/fcli/v3.6.0/fod-actions.html#_github_pr_comment) action or, if specified, the custom fcli action specified through `PR_COMMENT_ACTION`. Extra options for the fcli action can be passed through the `PR_COMMENT_EXTRA_OPTS` environment variable, for example to allow an unsigned custom action to be used. Please see the [Fcli Actions](#fortify-on-demand-fcli-actions) and [Pull Request Comments](#fortify-on-demand-pull-request-comments) sections below for more details.|
| TOOL_DEFINITIONS | Fortify tool definitions are used by this GitHub Action to determine available versions, download location and other details of various Fortify-related tools, as required for action execution. By default, the Fortify-provided tool definitions hosted at https://github.com/fortify/tool-definitions/releases/tag/v1 will be used.<br/><br/>This environment variable allows for overriding the default tool definitions, pointing to either a URL or local (workspace) file. For example, if GitHub workflows are not allowed to download tools from their public internet locations, customers may host the tool installation bundles on an internal server, together with a customized tool definitions bundle that lists the alternative download URLs. |


<!-- START-INCLUDE:action/_generic/fod/fod-fcli-actions.md -->

### Fortify on Demand Fcli Actions

<!-- Note that similar instructions are provided for SSC in ssc-fcli-actions.md; when updating these instructions, ssc-fcli-actions.md will likely need to be updated accordingly -->


<!-- START-INCLUDE:action/_generic/fcli-actions.md -->

As indicated in the [Action environment variable inputs](#action-environment-variable-inputs) section above, this GitHub Action utilizes one or more fcli actions to perform certain activities. These fcli-provided actions are used as building blocks that can be re-used across different CI/CD platforms to provide consistent behavior across those platforms. This GitHub Action also provides the ability to override the default built-in fcli actions with custom fcli actions, allowing for rich customization capabilities. For example, such custom fcli actions could define different default values for some action options, perform some additional activities, and/or provide fully customized behavior.

For more information on fcli actions and custom action development, please see the [fcli action documentation](https://fortify.github.io/fcli/v3.6.0/#_actions). Such custom actions may be hosted either on the local file system (for example stored in your source code repository) or some remote location; the `*_ACTION` environment variables may point to either a local file or URL. To easily share custom actions across multiple pipelines, you may want to consider hosting these in a dedicated source code repository that's accessible by all pipelines. This provides an easy hosting location, and allows for easy maintenance of such custom actions.

<!-- END-INCLUDE:action/_generic/fcli-actions.md -->


When developing custom actions, please note that the GitHub Action expects certain action parameters to be supported by such a custom action. A common example is the `--rel` / `--release` command-line option, which the GitHub Action will automatically pass to most or all fcli actions to specify the release to operate on. What command-line options are automatically passed to the fcli action may also depend on GitHub Action configuration. If the custom action doesn't support those action parameters, the action invocation will fail. You will also need to consider any options explicitly configured through the `*_EXTRA_OPTS` environment variable; for backward compatibility with existing GitHub Action workflows that have been configured with some extra action options, you should be careful with removing or renaming any action parameters.

Future versions of this documentation may provide more details on what command-line options are automatically passed to fcli actions. Until then, you'll need to review workflow logs and/or GitHub Action source code to identify what action parameters are being automatically passed by the GitHub Action. Alternatively, you may want to consider simply duplicating all action parameters from the fcli built-in action, even if some of those parameters will not be used by your custom action.

<!-- END-INCLUDE:action/_generic/fod/fod-fcli-actions.md -->



<!-- START-INCLUDE:action/_generic/fod/fod-pr.md -->

### Fortify on Demand Pull Request Comments

<!-- Note that similar instructions are provided for SSC in ssc-pr.md; when updating these instructions, ssc-pr.md will likely need to be updated accordingly -->

This section provides more information on Pull Request Comments that will be generated if `DO_PR_COMMENT` is set to `true`. This information is based on the fcli-provided [`github-pr-comment`](https://fortify.github.io/fcli/v3.6.0/fod-actions.html#_github_pr_comment) action and may not apply when using a custom fcli action through `PR_COMMENT_ACTION`. 

**Important note:** Pull Request comments are currently considered preview functionality. Configuration settings, behavior and output may significantly change in future GitHub Action releases as we work on improving and fine-tuning our PR decoration capabilities.

Pull request comments will only be generated under the following conditions:

* Standard `GITHUB_REF_NAME` environment variable points to a pull request, which is only the case on GitHub `pull_request` triggers and not for example `manual` triggers (even if the branch is associated with a current pull request).
* All other standard GitHub environment variables like `GITHUB_TOKEN`, `GITHUB_REPOSITORY` and `GITHUB_SHA` are set.

PR comments are generated by comparing scan results from the current GitHub Action run against the previous scan in the same application release; it won't detect any new/removed issues from older scans. For best results, you should configure your workflow as follows:

- For any branches for which you might want to generate PR comments, have the workflow trigger only on `pull_request` events. Note that you can have a single workflow that is triggered on both `push` events for your main branch, and only `pull_request` events for all other branches.
- Don't set `FOD_RELEASE`, to use the default value that corresponds to repository and branch name.
- Set `DO_SETUP` to `true`, to allow a branch-specific application release to be automatically created.
- Include `--copy-from` option in `SETUP_EXTRA_OPTS` to copy state from the release that represents the PR target branch or your main branch into the newly created application release.

With a setup like this, whenever a new PR is created, the GitHub Action will:
- Create a new application release named `<repository owner>/<repository name>:<branch name>`.
- Copy state from the application release identified by the `--copy-from` option to this new application release.
- Run a new scan of the branch associated with the current PR, and upload results to the application release created above.
- Generate a PR comment listing new and removed issues, based on comparing the results of the new scan that was run in the previous step against the scan results that were copied from the application release identified by the `--copy-from` option.

If any subsequent updates are pushed to the PR and the workflow is also being triggered on PR update events, the GitHub Action will run a new scan of the branch associated with the PR, publish results to the existing branch-specific application release, and generate a new PR comment that shows any new/removed issues in the new scan compared to the previous scan for the same branch/PR.

<!-- END-INCLUDE:action/_generic/fod/fod-pr.md -->


## Application Security Testing with SSC/ScanCentral

The standard workflow provided by this GitHub Action allows for running a static scan on ScanCentral SAST and/or running software composition analysis on Debricked. The following sample snippet demonstrates how to invoke this GitHub Action from a GitHub Actions workflow:

```yaml
    steps:    
      - name: Check out source code
        uses: actions/checkout@v4  
      - name: Run ScanCentral SAST & Debricked scan
        uses: fortify/github-action@v2
        with:
          sast-scan: true
          debricked-sca-scan: true
        env:
          SSC_URL: ${{vars.SSC_URL}}
          SSC_TOKEN: ${{secrets.SSC_TOKEN}}
          SC_SAST_TOKEN: ${{secrets.SC_SAST_CLIENT_AUTH_TOKEN}}
          # SSC_LOGIN_EXTRA_OPTS: --socket-timeout=60s
          DEBRICKED_TOKEN: ${{secrets.DEBRICKED_TOKEN}}
          # SSC_APPVERSION: MyApp:MyVersion
          # DO_SETUP: true
          # SETUP_ACTION: https://scm.my.org/shared-repos/fcli-actions/setup.yaml
          # SETUP_EXTRA_OPTS: --on-unsigned=ignore
          # SC_CLIENT_VERSION: 24.4.1
          # DO_PACKAGE_DEBUG: true
          # PACKAGE_EXTRA_OPTS: -oss -bt mvn
          # SC_SAST_SENSOR_VERSION: 24.4.1
          # EXTRA_SC_SAST_SCAN_OPTS: 
          # DO_WAIT: true
          # DO_POLICY_CHECK: true
          # POLICY_CHECK_ACTION: https://scm.my.org/shared-repos/fcli-actions/check-policy.yaml
          # POLICY_CHECK_EXTRA_OPTS: --on-unsigned=ignore
          # DO_JOB_SUMMARY: true
          # JOB_SUMMARY_ACTION: https://scm.my.org/shared-repos/fcli-actions/job-summary.yaml
          # JOB_SUMMARY_EXTRA_OPTS: --on-unsigned=ignore
          # DO_PR_COMMENT: true
          # PR_COMMENT_ACTION: https://scm.my.org/shared-repos/fcli-actions/github-pr-comment.yaml
          # PR_COMMENT_EXTRA_OPTS: --on-unsigned=ignore
          # DO_EXPORT: true
          # EXPORT_ACTION: https://scm.my.org/shared-repos/fcli-actions/github-sast-report.yaml
          # EXPORT_EXTRA_OPTS: --on-unsigned=ignore
          # TOOL_DEFINITIONS: https://ftfy.mycompany.com/tool-definitions/v1/tool-definitions.yaml.zip
```

### Action inputs

This section lists the inputs that can be specified in the `with:` clause for this GitHub Action. Any inputs marked in **bold** are required.

| Action input | Description |
| :--- | :--- |
| sast&#8209;scan | If set to `true`, run a static scan. If not specified or set to `false`, no static scan will be run. |
| debricked&#8209;sca&#8209;scan | If set to `true`, run Debricked Software Composition Analysis. If not specified or set to `false`, no software composition analysis will be performed. |

### Action environment variable inputs

This section lists the environment variables that can be specified in the `env:` clause for this GitHub Action. Any environment variables marked in **bold** are required.

| Environment variable | Description |
| :--- | :--- |
|**SSC_URL**|Fortify Software Security Center URL, for example https://ssc.customer.fortifyhosted.net/. Note: Using GitHub Secrets to define this URL may cause links back to SSC to be rendered incorrectly, for example in GitHub Action workflow summaries. It is highly recommended to either hard-code the URL in your workflow, or to use [GitHub Variables](https://docs.github.com/en/actions/writing-workflows/choosing-what-your-workflow-does/store-information-in-variables) instead of GitHub Secrets.|
|**SSC_TOKEN**|Required when authenticating with an SSC token (recommended). Most actions should work fine with a `CIToken`.|
|**SSC_USER<br/>SSC_PASSWORD**|Required when authenticating with SSC user credentials.|
|**SC_SAST_TOKEN**|ScanCentral SAST Client Authentication Token for authenticating with ScanCentral SAST Controller. This environment variable is required when running a ScanCentral SAST scan.|
|SSC_LOGIN_EXTRA_OPTS<br/>EXTRA_SSC_LOGIN_OPTS|Extra SSC login options, for example for disabling SSL checks or changing connection time-outs; see [`fcli ssc session login` documentation](https://fortify.github.io/fcli/v3.6.0//manpage/fcli-ssc-session-login.html). Note that `EXTRA_SSC_LOGIN_OPTS` is deprecated; please use `SSC_LOGIN_EXTRA_OPTS`.|
|**DEBRICKED_TOKEN**|Required when performing a Debricked Software Composition Analysis scan; see the [Generate access token](https://docs.debricked.com/product/administration/generate-access-token) section in the Debricked documentation for details on how to generate this token.|
|SSC_APPVERSION|Fortify SSC application version to use with this action. This can be specified either as a numeric application version id, or by providing application and version name in the format `<app-name>:<version-name>`. Default value is based on repository and branch name, for example `myOrg/myRepo:myBranch`.|
|DO_SETUP<br/>SETUP_ACTION<br/>SETUP_EXTRA_OPTS|If `DO_SETUP` is set to `true` (implied if any of the other two `SETUP_*` variables are set), the SSC application version will be automatically created if they do not yet exist, using the fcli-provided [`setup-appversion`](https://fortify.github.io/fcli/v3.6.0/ssc-actions.html#_setup_appversion) or, if specified, the custom fcli action specified through `SETUP_ACTION`. Extra options for the fcli action can be passed through the `SETUP_EXTRA_OPTS` environment variable, for example to copy state from an existing application version using the `--copy-from` option, or to allow an unsigned custom action to be used. Note that if setup is enabled, `SSC_APPVERSION` must be configured with a qualified application version name; you cannot use application version id. Please see the [SSC Fcli Actions](#ssc-fcli-actions) section below for more details.|
| SC_CLIENT_VERSION | By default, this action uses ScanCentral Client 25.2.0 for packaging. This environment variable allows for overriding the ScanCentral Client version used for packaging. |
|DO_PACKAGE_DEBUG| If set to true, this will enable the `-debug` option on the `scancentral` command, and store both ScanCentral logs and the `package.zip` file as job artifacts.|
|PACKAGE_EXTRA_OPTS<br/>EXTRA_PACKAGE_OPTS| By default, this action runs `scancentral package -o package.zip` to package application source code. Use `PACKAGE_EXTRA_OPTS` to specify additional packaging options, for example `PACKAGE_EXTRA_OPTS: -bt mvn -bf <custom build file>`. See [Command-line options for the package command](https://www.microfocus.com/documentation/fortify-software-security-center/2520/sc-sast-ugd-html-25.2.0/index.htm#cli/package-cmd.htm) for more information on available options. Note that `EXTRA_PACKAGE_OPTS` is deprecated; please use `PACKAGE_EXTRA_OPTS`.|
|SC_SAST_SENSOR_VERSION|Version of the ScanCentral SAST sensor on which the scan should be performed; see [`fcli sc-sast scan start` documentation](https://fortify.github.io/fcli/v3.6.0//manpage/fcli-sc-sast-scan-start.html) for details.|
|SC_SAST_SCAN_EXTRA_OPTS<br/>EXTRA_SC_SAST_SCAN_OPTS|Extra ScanCentral SAST scan options; see [`fcli sc-sast scan start` documentation](https://fortify.github.io/fcli/v3.6.0//manpage/fcli-sc-sast-scan-start.html). Note that `EXTRA_SC_SAST_SCAN_OPTS` is deprecated; please use `SC_SAST_SCAN_EXTRA_OPTS`.|
| DO_WAIT | By default, this action will not wait until scans have been completed. To have the workflow wait until all scans have been completed, set the `DO_WAIT` environment variable to `true`. Note that some other environment variables imply `DO_WAIT`, for example when exporting vulnerability data or generating job summaries. This behavior is documented in the applicable environment variable descriptions. |
|DO_POLICY_CHECK<br/>CHECK_POLICY_ACTION<br/>CHECK_POLICY_EXTRA_OPTS|If `DO_POLICY_CHECK` is set to `true` (implied if any of the other two `CHECK_POLICY_*` variables are set, and implies `DO_WAIT`), a policy check will be run after scan completion using the fcli-provided [SSC `check-policy`](https://fortify.github.io/fcli/v3.6.0/ssc-actions.html#_check_policy) or, if specified, the custom fcli action specified through `CHECK_POLICY_ACTION`. Extra options for a custom fcli action can be passed through the `CHECK_POLICY_EXTRA_OPTS` environment variable, which may include fcli options to allow unsigned custom actions to be used. Please see the [SSC Fcli Actions](#ssc-fcli-actions) section below for more details.|
|DO_JOB_SUMMARY<br/>JOB_SUMMARY_ACTION<br/>JOB_SUMMARY_EXTRA_OPTS|If `DO_JOB_SUMMARY` is set to `true` (implied if any of the other two `JOB_SUMMARY_*` variables are set, and implies `DO_WAIT`), a job summary listing scan status and issue counts will be generated using the fcli-provided [SSC `appversion-summary`](https://fortify.github.io/fcli/v3.6.0/ssc-actions.html#_appversion_summary) or, if specified, the custom fcli action specified through `JOB_SUMMARY_ACTION`. Extra options for the fcli action can be passed through the `JOB_SUMMARY_EXTRA_OPTS` environment variable, for example to allow an unsigned custom action to be used or to specify an SSC filter set. Please see the [SSC Fcli Actions](#ssc-fcli-actions) section below for more details. |
| DO_EXPORT<br/>EXPORT_ACTION<br/>EXPORT_EXTRA_OPTS | If `DO_EXPORT` is set to `true` (implied if any of the other two `EXPORT_*` variables are set, and implies `DO_WAIT`), this GitHub Action will will export scan results to the GitHub Security Code Scanning dashboard using the fcli-provided [SSC `github-sast-report`](https://fortify.github.io/fcli/v3.6.0/ssc-actions.html#_github_sast_report) action or, if specified, the custom fcli action specified through `EXPORT_ACTION`. Extra options for the fcli action can be passed through the `EXPORT_EXTRA_OPTS` environment variable, for example to to allow an unsigned custom action to be used or to specify an alternative SSC filter set. Please see the [SSC Fcli Actions](#ssc-fcli-actions) section below for more details.<br/><br/>Note that this may require a [GitHub Advanced Security](https://docs.github.com/en/get-started/learning-about-github/about-github-advanced-security) subscription, unless you're running this action on a public github.com repository. GitHub only supports importing SAST results; other results will not exported to GitHub. |
|(PREVIEW)<br/>DO_PR_COMMENT<br/>PR_COMMENT_ACTION<br/>PR_COMMENT_EXTRA_OPTS|If `DO_PR_COMMENT` is set to `true` (implied if any of the other two `PR_COMMENT_*` variables are set, and implies `DO_WAIT`), a pull request comment listing new, re-introduced and removed issues will be generated using the fcli-provided [SSC `github-pr-comment`](https://fortify.github.io/fcli/v3.6.0/ssc-actions.html#_github_pr_comment) action or, if specified, the custom fcli action specified through `PR_COMMENT_ACTION`. Extra options for the fcli action can be passed through the `PR_COMMENT_EXTRA_OPTS` environment variable, for example to allow an unsigned custom action to be used or to specify a different SSC filter set. Please see the [SSC Fcli Actions](#ssc-fcli-actions) and [SSC Pull Request Comments](#ssc-pull-request-comments) sections below for more details.|
| TOOL_DEFINITIONS | Fortify tool definitions are used by this GitHub Action to determine available versions, download location and other details of various Fortify-related tools, as required for action execution. By default, the Fortify-provided tool definitions hosted at https://github.com/fortify/tool-definitions/releases/tag/v1 will be used.<br/><br/>This environment variable allows for overriding the default tool definitions, pointing to either a URL or local (workspace) file. For example, if GitHub workflows are not allowed to download tools from their public internet locations, customers may host the tool installation bundles on an internal server, together with a customized tool definitions bundle that lists the alternative download URLs. |


<!-- START-INCLUDE:action/_generic/ssc/ssc-fcli-actions.md -->

### SSC Fcli Actions

<!-- Note that similar instructions are provided for FoD in fod-fcli-actions.md; when updating these instructions, fod-fcli-actions.md will likely need to be updated accordingly -->


<!-- START-INCLUDE:action/_generic/fcli-actions.md -->

As indicated in the [Action environment variable inputs](#action-environment-variable-inputs) section above, this GitHub Action utilizes one or more fcli actions to perform certain activities. These fcli-provided actions are used as building blocks that can be re-used across different CI/CD platforms to provide consistent behavior across those platforms. This GitHub Action also provides the ability to override the default built-in fcli actions with custom fcli actions, allowing for rich customization capabilities. For example, such custom fcli actions could define different default values for some action options, perform some additional activities, and/or provide fully customized behavior.

For more information on fcli actions and custom action development, please see the [fcli action documentation](https://fortify.github.io/fcli/v3.6.0/#_actions). Such custom actions may be hosted either on the local file system (for example stored in your source code repository) or some remote location; the `*_ACTION` environment variables may point to either a local file or URL. To easily share custom actions across multiple pipelines, you may want to consider hosting these in a dedicated source code repository that's accessible by all pipelines. This provides an easy hosting location, and allows for easy maintenance of such custom actions.

<!-- END-INCLUDE:action/_generic/fcli-actions.md -->


When developing custom actions, please note that the GitHub Action expects certain action parameters to be supported by such a custom action. A common example is the `--av` / `--appversion` command-line option, which the GitHub Action will automatically pass to most or all fcli actions to specify the SSC application version to operate on. What command-line options are automatically passed to the fcli action may also depend on GitHub Action configuration. If the custom action doesn't support those action parameters, the action invocation will fail. You will also need to consider any options explicitly configured through the `*_EXTRA_OPTS` environment variable; for backward compatibility with existing GitHub Action workflows that have been configured with some extra action options, you should be careful with removing or renaming any action parameters.

Future versions of this documentation may provide more details on what command-line options are automatically passed to fcli actions. Until then, you'll need to review workflow logs and/or GitHub Action source code to identify what action parameters are being automatically passed by the GitHub Action. Alternatively, you may want to consider simply duplicating all action parameters from the fcli built-in action, even if some of those parameters will not be used by your custom action.

<!-- END-INCLUDE:action/_generic/ssc/ssc-fcli-actions.md -->



<!-- START-INCLUDE:action/_generic/ssc/ssc-pr.md -->

### SSC Pull Request Comments

<!-- Note that similar instructions are provided for FoD in fod-pr.md; when updating these instructions, fod-pr.md will likely need to be updated accordingly -->

This section provides more information on Pull Request Comments that will be generated if `DO_PR_COMMENT` is set to `true`. This information is based on the fcli-provided [SSC `github-pr-comment`](https://fortify.github.io/fcli/v3.6.0/ssc-actions.html#_github_pr_comment) action and may not apply when using a custom fcli action through `PR_COMMENT_ACTION`.

**Important note:** Pull Request comments are currently considered preview functionality. Configuration settings, behavior and output may significantly change in future GitHub Action releases as we work on improving and fine-tuning our PR decoration capabilities.

Pull request comments will only be generated under the following conditions:

* Standard `GITHUB_REF_NAME` environment variable points to a pull request, which is only the case on GitHub `pull_request` triggers and not for example `manual` triggers (even if the branch is associated with a current pull request).
* All other standard GitHub environment variables like `GITHUB_TOKEN`, `GITHUB_REPOSITORY` and `GITHUB_SHA` are set.

PR comments are generated by comparing scan results from the current GitHub Action run against the previous scan in the same application version; it won't detect any new/removed issues from older scans. For best results, you should configure your workflow as follows:

- For any branches for which you might want to generate PR comments, have the workflow trigger only on `pull_request` events. Note that you can have a single workflow that is triggered on both `push` events for your main branch, and only `pull_request` events for all other branches.
- Don't set `SSC_APPVERSION`, to use the default value that corresponds to repository and branch name.
- Set `DO_SETUP` to `true`, to allow a branch-specific application version to be automatically created.
- Include `--copy-from` option in `SETUP_EXTRA_OPTS` to copy state from the application version that represents the PR target branch or your main branch into the newly created application version.

With a setup like this, whenever a new PR is created, the GitHub Action will:
- Create a new application version named `<repository owner>/<repository name>:<branch name>`.
- Copy state from the application version identified by the `--copy-from` option to this new application version.
- Run a new scan of the branch associated with the current PR, and upload results to the application version created above.
- Generate a PR comment listing new and removed issues, based on comparing the results of the new scan that was run in the previous step against the scan results that were copied from the application version identified by the `--copy-from` option.

If any subsequent updates are pushed to the PR and the workflow is also being triggered on PR update events, the GitHub Action will run a new scan of the branch associated with the PR, publish results to the existing branch-specific application version, and generate a new PR comment that shows any new/removed issues in the new scan compared to the previous scan for the same branch/PR.

<!-- END-INCLUDE:action/_generic/ssc/ssc-pr.md -->



## Building blocks for custom workflows

This GitHub Action provides a lot of flexibility with regards to what operations to run as controlled through the various `DO_*` environment variables, and also allows for customizing some of these operations by utilizing custom fcli actions through the `*_ACTION` environment variables. However, there may be situations where the standard workflow provided by this GitHub Action doesn't meet your needs, for example if you need to run Dynamic or Mobile scans.

The modular implementation of this GitHub Action allows for implementing custom workflows based on the various re-usable sub-actions available in this repository. The following sub-actions that can be used as building blocks for custom workflows are currently available for public use:

| Action | Description |
| :---   | :---        |
| [fortify/github&#8209;action/setup](https://github.com/fortify/github-action/tree/v2/setup#readme) | This sub-action allows for installing various Fortify tools like fcli or ScanCentral Client for later use in your GitHub Actions workflow. This allows for implementing fully customized workflows that can easily utilize the various Fortify tools to interact with Fortify products and Debricked. |
| [fortify/github&#8209;action/package](https://github.com/fortify/github-action/tree/v2/package#readme) | This sub-action can be used to easily package your source code for static scans, with the action handling low-level details like installation of ScanCentral Client and required Java version. |
| [fortify/github&#8209;action/fod&#8209;export](https://github.com/fortify/github-action/tree/v2/fod-export#readme) | This sub-action allows for exporting vulnerability data from Fortify on Demand to the GitHub Security dashboard, with the action handling low-level details like installing the necessary Fortify tools, exporting the vulnerability data, and uploading this data to GitHub. |
| [fortify/github&#8209;action/ssc&#8209;export](https://github.com/fortify/github-action/tree/v2/ssc-export#readme) | This sub-action allows for exporting vulnerability data from SSC to the GitHub Security dashboard, with the action handling low-level details like installing the necessary Fortify tools, exporting the vulnerability data, and uploading this data to GitHub. |

The `fortify/github-action` repository also provides the publicly available sub-actions listed in the table below, but these provide the full scan workflows as provided by this GitHub Action, with the top-level `fortify/github-action` simply invoking one of these sub-actions based on action inputs and environment variables. As such, these sub-actions are not meant to provide re-usable building blocks, but it may be useful to look at the implementations of these sub-actions if you want to re-use any of their functionality in your custom workflows.

| Action | Description |
| :---   | :---        |
| [fortify/github&#8209;action/fod&#8209;sast&#8209;scan](https://github.com/fortify/github-action/tree/v2/fod-sast-scan#readme) | Run a Fortify on Demand SAST scan. |
| [fortify/github&#8209;action/sc&#8209;sast&#8209;scan](https://github.com/fortify/github-action/tree/v2/sc-sast-scan#readme) | Run a ScanCentral SAST scan and optional Debricked scan. |
| [fortify/github&#8209;action/ssc&#8209;debricked&#8209;scan](https://github.com/fortify/github-action/tree/v2/ssc-debricked-scan#readme) | Run a Debricked-only scan and import scan results into SSC. |

These actions utilize the re-usable building blocks mentioned above, in combination with several sub-actions that are meant for internal use only. However, the source code of these internal-only sub-actions is publicly available, allowing you to gain a better understanding of how these are used to implement the functionality provided by `fortify/github-action` and potentially re-use some of the ideas or code in your custom workflows. In particular, the `bash` scripts provided by the [`fortify/github-action/internal/run-script`](https://github.com/fortify/github-action/tree/v2/internal/run-script/scripts) provide some of the core functionality provided by this GitHub Action.

<!-- END-INCLUDE:action/_root/readme.md -->



<!-- START-INCLUDE:h2.support.md -->

## Support

For general assistance, please join the [Fortify Community](https://community.opentext.com/cybersec/fortify/) to get tips and tricks from other users and the OpenText team.
 
OpenText customers can contact our world-class [support team](https://www.opentext.com/support/opentext-enterprise/) for questions, enhancement requests and bug reports. You can also raise questions and issues through your OpenText Fortify representative like Customer Success Manager or Technical Account Manager if applicable.

You may also consider raising questions or issues through the [GitHub Issues page](https://github.com/fortify/github-action/issues) (if available for this repository), providing public visibility and allowing anyone (including all contributors) to review and comment on your question or issue. Note that this requires a GitHub account, and given public visibility, you should refrain from posting any confidential data through this channel. 

<!-- END-INCLUDE:h2.support.md -->


---

*[This document was auto-generated; do not edit by hand](https://github.com/fortify/shared-doc-resources/blob/main/USAGE.md)*
