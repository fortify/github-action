This action performs a Debricked Software Composition Analysis (SCA) scan, consisting of the following steps:

* Login to Fortify SSC
* Run Debricked scan
* Publish Debricked scan results to Fortify SSC
* Optionally wait for SSC artifact processing to complete

Note that this action is explicitly meant for Debricked/SSC integration. If you wish to run a Debricked scan without publishing the results to SSC, please see the [Debricked GitHub Integration documentation](https://portal.debricked.com/integrations-48/integration-with-github-214#github-actions)

{{include:action/_generic/prerequisites-h3.md}}

Apart from the generic action prerequisites listed above, the following prerequisites apply to this specific action:

* The [Fortify SSC Parser Plugin for Debricked results](https://github.com/fortify/fortify-ssc-parser-debricked-cyclonedx) must be installed on Fortify SSC, to allow for SSC to accept and process the Debricked scan results submitted by this action.

### Sample usage

The sample workflow below demonstrates how to configure the action for running a Debricked scan and publishing the results to Fortify SSC.

```yaml
    steps:    
      - name: Check out source code
        uses: actions/checkout@v4  
      - name: Run Debricked Scan
        uses: fortify/github-action/ssc-debricked-scan@{{var:action-major-version}}
        env:
{{include:action/_generic/ssc/nocomments.snippet-ssc-login.md}}
{{include:action/_generic/debricked/nocomments.snippet-debricked-token.md}}
{{include:action/_generic/ssc/nocomments.snippet-ssc-appversion.md}}
{{include:action/_generic/nocomments.snippet-setup.md}}
{{include:action/_generic/nocomments.snippet-do-wait.md}}
{{include:action/_generic/nocomments.snippet-policy-check.md}}
{{include:action/_generic/nocomments.snippet-job-summary.md}}
{{include:action/_generic/nocomments.snippet-pr-comment.md}}
{{include:action/_generic/nocomments.snippet-export-optional.md}}
{{include:action/setup/nocomments.snippet-tool-definitions.md}}
```

{{include:action/_generic/nocomments.env-section-and-table-header.md}}
{{include:action/_generic/ssc/nocomments.env-ssc-login.md}}
{{include:action/_generic/debricked/nocomments.env-debricked-token.md}}
{{include:action/_generic/ssc/nocomments.env-ssc-appversion.md}}
{{include:action/sc-sast-scan/nocomments.env-setup.md}}
{{include:action/_generic/nocomments.env-do-wait.md}}
{{include:action/sc-sast-scan/nocomments.env-policy-check.md}}
{{include:action/sc-sast-scan/nocomments.env-job-summary.md}}
{{include:action/ssc-export/nocomments.env-export-optional.md}}
{{include:action/sc-sast-scan/nocomments.env-pr-comment.md}}
{{include:action/setup/nocomments.env-tool-definitions.md}}

{{include:action/_generic/ssc/ssc-fcli-actions.md}}

{{include:action/_generic/ssc/ssc-pr.md}}

