This action exports the latest vulnerability data from an FoD release to the GitHub Code Scanning dashboard. Note that this may require a [GitHub Advanced Security](https://docs.github.com/en/get-started/learning-about-github/about-github-advanced-security) subscription, unless you're running this action on a public github.com repository.

### Action environment variable inputs

{{include:env-fod-connection.md}}

{{include:env-fod-release.md}}

{{include:env-setup.md}}

### Sample usage

The sample workflow below demonstrates how to configure the action for exporting FoD SAST vulnerability data to the GitHub Security Code Scanning dashboard.

```yaml
    steps:    
      - name: Export FoD vulnerability data to GitHub
        uses: fortify/github-action/fod-export@{{var:action-major-version}}
        env:
{{include:nocomments.env-fod-connection-sample.md}}
{{include:nocomments.env-fod-release-sample.md}}
{{include:nocomments.env-setup-sample.md}}
```
