This action exports the latest vulnerability data from an SSC application version to the GitHub Code Scanning dashboard. Note that this may require a [GitHub Advanced Security](https://docs.github.com/en/get-started/learning-about-github/about-github-advanced-security) subscription, unless you're running this action on a public github.com repository.

{{include:action-prerequisites.md}}

### Action environment variable inputs

{{include:env-ssc-connection.md}}

{{include:env-ssc-appversion.md}}

{{include:env-do-export.md}}

{{include:env-setup.md}}

### Sample usage

The sample workflow below demonstrates how to configure the action for exporting SSC SAST vulnerability data to the GitHub Security Code Scanning dashboard.

```yaml
    steps:    
      - name: Export SSC vulnerability data to GitHub
        uses: fortify/github-action/ssc-export@{{var:action-major-version}}
        env:
{{include:nocomments.env-ssc-connection-sample.md}}
{{include:nocomments.env-ssc-appversion-sample.md}}
{{include:nocomments.env-setup-sample.md}}
```
