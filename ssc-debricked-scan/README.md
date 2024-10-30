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
Fortify Software Security Center URL, for example https://ssc.customer.fortifyhosted.net/. Note: Using GitHub Secrets to define this URL may cause links back to SSC to be rendered incorrectly, for example in GitHub Action workflow summaries. It is highly recommended to either hard-code the URL in your workflow, or to use [GitHub Variables](https://docs.github.com/en/actions/writing-workflows/choosing-what-your-workflow-does/store-information-in-variables) instead of GitHub Secrets.

**`SSC_TOKEN`** - REQUIRED*   
Required when authenticating with an SSC token (recommended). Most actions should work fine with a `CIToken`.

**`SSC_USER` & `SSC_PASSWORD`** - REQUIRED*   
Required when authenticating with SSC user credentials.

<!-- END-INCLUDE:env-ssc-connection.md -->



<!-- START-INCLUDE:env-ssc-login.md -->

**`EXTRA_SSC_LOGIN_OPTS` (deprecated), `SSC_LOGIN_EXTRA_OPTS`** - OPTIONAL    
Extra SSC login options, for example for disabling SSL checks or changing connection time-outs; see [`fcli ssc session login` documentation](https://fortify.github.io/fcli/v2.9.0//manpage/fcli-ssc-session-login.html).

<!-- END-INCLUDE:env-ssc-login.md -->


**`DEBRICKED_TOKEN`** - REQUIRED          
See the [Generate access token](https://docs.debricked.com/product/administration/generate-access-token) section in the Debricked documentation for details on how to generate this token.


<!-- START-INCLUDE:env-ssc-appversion.md -->

**`SSC_APPVERSION`** - OPTIONAL   
Fortify SSC application version to use with this action. This can be specified either as a numeric application version id, or by providing application and version name in the format `<app-name>:<version-name>`. Default value is [`<github.repository>:<github.head_ref || github.ref_name>`](https://docs.github.com/en/actions/learn-github-actions/contexts#github-context), for example `myOrg/myRepo:myBranch`.

<!-- END-INCLUDE:env-ssc-appversion.md -->



<!-- START-INCLUDE:env-do-setup.md -->

**`DO_SETUP`, `SETUP_ACTION`, `SETUP_EXTRA_OPTS`** - OPTIONAL    
If `DO_SETUP` is set to `true` (implied if any of the other two `SETUP_*` variables are set), this action will set up the FoD release / SSC application version, creating those if they do not yet exist, using the fcli-provided [FoD `setup-release`](https://fortify.github.io/fcli/v2.9.0/fod-actions.html#_setup_release)  or [SSC `setup-appversion`](https://fortify.github.io/fcli/v2.9.0/ssc-actions.html#_setup_appversion) action, or, if specified, the custom fcli action specified through `SETUP_ACTION`. `SETUP_ACTION` may point to a local file or URL; this custom fcli action must support (at least) the exact same action parameters (including any environment variable based default values for those parameters) as the built-in fcli action. Any extra options for the fcli action can be passed through the `SETUP_EXTRA_OPTS` environment variable, for example to copy from an existing release/application version, or to allow an unsigned custom action to be used.

Note that if setup is enabled, `FOD_RELEASE` or `SSC_APPVERSION` must be configured with a qualified release/version name; you cannot use release/version id.

<!-- END-INCLUDE:env-do-setup.md -->



<!-- START-INCLUDE:env-do-wait.md -->

**`DO_WAIT`** - OPTIONAL    
By default, this action will not wait until scans have been completed. To have the workflow wait until all scans have been completed, set the `DO_WAIT` environment variable to `true`. Note that some other environment variables imply `DO_WAIT`, for example when exporting vulnerability data or generating job summaries. This behavior is documented in the applicable environment variable descriptions.

<!-- END-INCLUDE:env-do-wait.md -->



<!-- START-INCLUDE:env-do-policy-check.md -->

**`DO_POLICY_CHECK`, `CHECK_POLICY_ACTION`, `CHECK_POLICY_EXTRA_OPTS`** - OPTIONAL    
If `DO_POLICY_CHECK` is set to `true` (implied if any of the other two `CHECK_POLICY_*` variables are set, and implies `DO_WAIT`), a policy check will be run after scan completion using the fcli-provided [FoD `check-policy`](https://fortify.github.io/fcli/v2.9.0/fod-actions.html#_check_policy) or [SSC `check-policy`](https://fortify.github.io/fcli/v2.9.0/ssc-actions.html#_check_policy) action or, if specified, the custom fcli action specified through `CHECK_POLICY_ACTION`. `POLICY_CHECK_ACTION` may point to a local file or URL; this custom fcli action must accept at least the `--av` (for SSC) or `--rel` (for FoD) option. Any extra options for this custom fcli action can be passed through the `CHECK_POLICY_EXTRA_OPTS` environment variable, which may include fcli options to allow unsigned custom actions to be used. Note that for FoD, the fcli-provided `check-policy` action will check the outcome of the FoD security policy. As SSC doesn't provide any similar security policy features, the fcli-provided action executes some sample policy checks that will likely fail in many cases. As security policies are different for every Fortify customer, you should consider implementing your own custom fcli policy check action(s), unless FoD-provided security policy functionality is sufficient.

<!-- END-INCLUDE:env-do-policy-check.md -->



<!-- START-INCLUDE:env-do-job-summary.md -->

**`DO_JOB_SUMMARY`, `JOB_SUMMARY_ACTION`, `JOB_SUMMARY_EXTRA_OPTS`** - OPTIONAL    
If `DO_JOB_SUMMARY` is set to `true` (implied if any of the other two `JOB_SUMMARY_*` variables are set, and implies `DO_WAIT`), this action will generate a job summary listing scan status and issue counts using the fcli-provided [FoD `release-summary`](https://fortify.github.io/fcli/v2.9.0/fod-actions.html#_release_summary) or [SSC `appversion-summary`](https://fortify.github.io/fcli/v2.9.0/ssc-actions.html#_appversion_summary) action, or, if specified, the custom fcli action specified through `JOB_SUMMARY_ACTION`. `JOB_SUMMARY_ACTION` may point to a local file or URL; this custom fcli action must support (at least) the exact same action parameters (including any environment variable based default values for those parameters) as the built-in fcli action. Any extra options for the fcli action can be passed through the `JOB_SUMMARY_EXTRA_OPTS` environment variable, for example to specify the SSC filter sets to be included in the summary, or to allow an unsigned custom action to be used.

<!-- END-INCLUDE:env-do-job-summary.md -->



<!-- START-INCLUDE:env-do-pr-comment.md -->

**`DO_PR_COMMENT`, `PR_COMMENT_ACTION`, `PR_COMMENT_EXTRA_OPTS`** - OPTIONAL *(PREVIEW)*    
If `DO_PR_COMMENT` is set to `true` (implied if any of the other two `PR_COMMENT_*` variables are set, and implies `DO_WAIT`), this action will generate a pull request comment listing new, re-introduced and removed issues using the fcli-provided [FoD `github-pr-comment`](https://fortify.github.io/fcli/v2.9.0/fod-actions.html#_github_pr_comment) or [SSC `github-pr-comment`](https://fortify.github.io/fcli/v2.9.0/ssc-actions.html#_github_pr_comment) action or, if specified, the custom fcli action specified through `PR_COMMENT_ACTION`. `PR_COMMENT_ACTION` may point to a local file or URL; this custom fcli action must support (at least) the exact same action parameters (including any environment variable based default values for those parameters) as the built-in fcli action. Any extra options for the fcli action can be passed through the `PR_COMMENT_EXTRA_OPTS` environment variable, for example to specify the SSC filter set from which to load issue data, or to allow an unsigned custom action to be used.

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
          SSC_URL: ${{vars.SSC_URL}}
          SSC_TOKEN: ${{secrets.SSC_TOKEN}}
          # SSC_LOGIN_EXTRA_OPTS: --socket-timeout=60s
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
