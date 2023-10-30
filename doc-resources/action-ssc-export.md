This action exports the latest vulnerability data from an SSC application version to the GitHub Code Scanning dashboard.

### Action environment variable inputs

{{include:env-ssc-connection.md}}

{{include:env-ssc-appversion.md}}

### Sample usage

The sample workflow below demonstrates how to configure the action for exporting FoD vulnerability data to the GitHub Security Code Scanning dashboard.

```yaml
    steps:    
      - name: Export SSC vulnerability data to GitHub
        uses: fortify/github-action/ssc-export@{{var:action-major-version}}
        env:
{{include:nocomments.env-ssc-connection-sample.md}}
{{include:nocomments.env-ssc-appversion-sample.md}}
```