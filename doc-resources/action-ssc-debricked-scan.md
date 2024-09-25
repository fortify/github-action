This action performs a Debricked Software Composition Analysis (SCA) scan, consisting of the following steps:

* Login to Fortify SSC
* Run Debricked scan
* Publish Debricked scan results to Fortify SSC
* Optionally wait for SSC artifact processing to complete

Note that this action is explicitly meant for Debricked/SSC integration. If you wish to run a Debricked scan without publishing the results to SSC, please see the [Debricked GitHub Integration documentation](https://portal.debricked.com/integrations-48/integration-with-github-214#github-actions)

{{include:action-prerequisites.md}}

Apart from the generic action prerequisites listed above, the following prerequisites apply to this specific action:

* The appropriate application version must exist on SSC. Future versions of this action may add support for automating application version creation.
* The [Fortify SSC Parser Plugin for Debricked results](https://github.com/fortify/fortify-ssc-parser-debricked-cyclonedx) must be installed on Fortify SSC, to allow for SSC to accept and process the Debricked scan results submitted by this action.

### Action environment variable inputs

{{include:env-ssc-debricked-scan.md}}

{{include:env-setup.md}}

### Sample usage

The sample workflow below demonstrates how to configure the action for running a Debricked scan and publishing the results to Fortify SSC.

```yaml
    steps:    
      - name: Check out source code
        uses: actions/checkout@v4  
      - name: Run Debricked Scan
        uses: fortify/github-action/ssc-debricked-scan@{{var:action-major-version}}
        env:
{{include:nocomments.env-ssc-debricked-scan-sample.md}}
{{include:nocomments.env-setup-sample.md}}
```