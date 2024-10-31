This action exports the latest vulnerability data from an FoD release to the GitHub Code Scanning dashboard. Note that this may require a [GitHub Advanced Security](https://docs.github.com/en/get-started/learning-about-github/about-github-advanced-security) subscription, unless you're running this action on a public github.com repository.

{{include:action/generic/prerequisites-h3.md}}

### Sample usage

The sample workflow below demonstrates how to configure the action for exporting FoD SAST vulnerability data to the GitHub Security Code Scanning dashboard.

```yaml
    steps:    
      - name: Export FoD vulnerability data to GitHub
        uses: fortify/github-action/fod-export@{{var:action-major-version}}
        env:
{{include:action/generic/fod/nocomments.snippet-fod-login.md}}
{{include:action/generic/fod/nocomments.snippet-fod-release.md}}
{{include:action/generic/nocomments.snippet-export.md}}
{{include:action/setup/nocomments.snippet-tool-definitions.md}}
```

{{include:action/generic/nocomments.env-section-and-table-header.md}}
{{include:action/generic/fod/nocomments.env-fod-login.md}}
{{include:action/generic/fod/nocomments.env-fod-release.md}}
{{include:action/fod-export/nocomments.env-export.md}}
{{include:action/setup/nocomments.env-tool-definitions.md}}

{{include:action/generic/fod/fod-fcli-actions.md}}