This action exports the latest SAST vulnerability data from an FoD release to the GitHub Code Scanning dashboard.

### Action environment variable inputs

{{include:env-fod-connection.md}}

{{include:env-fod-release.md}}

### Sample usage

The sample workflow below demonstrates how to configure the action for exporting FoD SAST vulnerability data to the GitHub Security Code Scanning dashboard.

```yaml
    steps:    
      - name: Export FoD vulnerability data to GitHub
        uses: fortify/github-action/fod-export@{{var:action-major-version}}
        env:
{{include:nocomments.env-fod-connection-sample.md}}
{{include:nocomments.env-fod-release-sample.md}}
```
