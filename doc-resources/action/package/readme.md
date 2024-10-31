This action packages application source code using [ScanCentral Client]({{var:sc-client-doc-base-url}}#cli/package-cmd.htm). The output package is saved as `package.zip`.

{{include:action/generic/prerequisites-h3.md}}

### Sample usage

The sample workflow below demonstrates how to configure the action for running a SAST scan on FoD.

```yaml
    steps:  
      - name: Check out source code
        uses: actions/checkout@v4  
      - name: Package source code
        uses: fortify/github-action/package@{{var:action-major-version}}
        env:
{{include:action/package/nocomments.snippet-package-extra-opts.md}}
{{include:action/setup/nocomments.snippet-tool-definitions.md}}
```

{{include:action/generic/nocomments.env-section-and-table-header.md}}
{{include:action/package/nocomments.env-package-extra-opts.md}}
{{include:action/setup/nocomments.env-tool-definitions.md}}