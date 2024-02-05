This action packages application source code using [ScanCentral Client]({{var:sc-client-doc-base-url}}#A_Clients.htm). The output package is saved as `package.zip`.

### Action environment variable inputs

{{include:env-package.md}}

{{include:env-setup.md}}

### Sample usage

The sample workflow below demonstrates how to configure the action for running a SAST scan on FoD.

```yaml
    steps:  
      - name: Check out source code
        uses: actions/checkout@v4  
      - name: Package source code
        uses: fortify/github-action/package@{{var:action-major-version}}
        env:
{{include:nocomments.env-package-sample.md}}
{{include:nocomments.env-setup-sample.md}}
```