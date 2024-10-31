This action exports the latest vulnerability data from an SSC application version to the GitHub Code Scanning dashboard. Note that this may require a [GitHub Advanced Security](https://docs.github.com/en/get-started/learning-about-github/about-github-advanced-security) subscription, unless you're running this action on a public github.com repository.

{{include:action/generic/prerequisites-h3.md}}

### Sample usage

The sample workflow below demonstrates how to configure the action for exporting SSC SAST vulnerability data to the GitHub Security Code Scanning dashboard.

```yaml
    steps:    
      - name: Export SSC vulnerability data to GitHub
        uses: fortify/github-action/ssc-export@{{var:action-major-version}}
        env:
{{include:action/generic/ssc/nocomments.snippet-ssc-login.md}}
{{include:action/generic/ssc/nocomments.snippet-ssc-appversion.md}}
{{include:action/generic/nocomments.snippet-export.md}}
{{include:action/setup/nocomments.snippet-tool-definitions.md}}
```

{{include:action/generic/nocomments.env-section-and-table-header.md}}
{{include:action/generic/ssc/nocomments.env-ssc-login.md}}
{{include:action/generic/ssc/nocomments.env-ssc-appversion.md}}
{{include:action/ssc-export/nocomments.env-export.md}}
{{include:action/setup/nocomments.env-tool-definitions.md}}

{{include:action/generic/ssc/ssc-fcli-actions.md}}
