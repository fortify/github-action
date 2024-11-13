This action exports the latest vulnerability data from a Fortify on Demand release to the GitHub Code Scanning dashboard. Note that this may require a [GitHub Advanced Security](https://docs.github.com/en/get-started/learning-about-github/about-github-advanced-security) subscription, unless you're running this action on a public github.com repository.

{{include:action/_generic/prerequisites-h3.md}}

### Sample usage

The sample workflow below demonstrates how to configure the action for exporting Fortify on Demand SAST vulnerability data to the GitHub Security Code Scanning dashboard.

```yaml
    steps:    
      - name: Export Fortify on Demand vulnerability data to GitHub
        uses: fortify/github-action/fod-export@{{var:action-major-version}}
        env:
{{include:action/_generic/fod/nocomments.snippet-fod-login.md}}
{{include:action/_generic/fod/nocomments.snippet-fod-release.md}}
{{include:action/_generic/nocomments.snippet-export.md}}
{{include:action/setup/nocomments.snippet-tool-definitions.md}}
```

{{include:action/_generic/nocomments.env-section-and-table-header.md}}
{{include:action/_generic/fod/nocomments.env-fod-login.md}}
{{include:action/_generic/fod/nocomments.env-fod-release.md}}
{{include:action/fod-export/nocomments.env-export.md}}
{{include:action/setup/nocomments.env-tool-definitions.md}}

{{include:action/_generic/fod/fod-fcli-actions.md}}