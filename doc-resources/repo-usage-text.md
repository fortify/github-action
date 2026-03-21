### Quick Start

#### OpenText Core Application Security (Fortify on Demand)

```yaml
name: Fortify on Demand Scan
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  fortify:
    runs-on: ubuntu-latest
    # permissions:               # When overriding default permissions, following are required:
    #   contents: read           # Required for checkout action
    #   security-events: write   # Required for publishing security reports to GitHub Security tab
    #   pull-requests: write     # Required if DO_PR_COMMENT is set to true
    steps:
      - uses: actions/checkout@v4            # Check out source code
      - uses: actions/setup-<build-tool>@vX  # Set up build tool(s) required to build your project
      # Run Fortify scans and upload debug artifacts if debugging is enabled; use one of
      # the following:
      # - Upload debug artifacts using github.com-compatible actions/upload-artifact@v7:
      #   uses: fortify/github-action/with-debug-upload-github@v3
      # - Upload debug artifacts using GHES-compatible actions/upload-artifact@v3:
      #   uses: fortify/github-action/with-debug-upload-ghes@v3
      # - Don't upload debug artifacts; use subsequent step to upload to alternative storage:
      #   uses: fortify/github-action@v3
      - uses: fortify/github-action/with-debug-upload-github@v3
        name: Run Fortify Scan
        id: fortify_scan
        env:
          FOD_URL: ${{ vars.FOD_URL }}
          FOD_CLIENT_ID: ${{ secrets.FOD_CLIENT_ID }}
          FOD_CLIENT_SECRET: ${{ secrets.FOD_CLIENT_SECRET }}
          # FOD_RELEASE: MyApp:main        # Optional: defaults to repo:branch
          # FCLI_BOOTSTRAP_VERSION: v3.15  # Optional if you prefer stability over latest
      # - name: Upload Fortify debug artifacts (custom)
      #   if: ${{ always() && steps.fortify_scan.outputs.upload-debug-artifacts == 'true' }}
      #   uses: <custom upload action>
      #   with:
      #     path: ${{ steps.fortify_scan.outputs.debug-artifacts-dir }}
```

#### OpenText Application Security (Fortify Software Security Center)

```yaml
name: Fortify SSC Scan
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  fortify:
    runs-on: ubuntu-latest
    # permissions:               # When overriding default permissions, following are required:
    #   contents: read           # Required for checkout action
    #   security-events: write   # Required for publishing security reports to GitHub Security tab
    #   pull-requests: write     # Required if DO_PR_COMMENT is set to true
    steps:
      - uses: actions/checkout@v4            # Check out source code
      - uses: actions/setup-<build-tool>@vX  # Set up build tool(s) required to build your project
      # Run Fortify scans and upload debug artifacts if debugging is enabled; use one of
      # the following:
      # - Upload debug artifacts using github.com-compatible actions/upload-artifact@v7:
      #   uses: fortify/github-action/with-debug-upload-github@v3
      # - Upload debug artifacts using GHES-compatible actions/upload-artifact@v3:
      #   uses: fortify/github-action/with-debug-upload-ghes@v3
      # - Don't upload debug artifacts; use subsequent step to upload to alternative storage:
      #   uses: fortify/github-action@v3
      - uses: fortify/github-action/with-debug-upload-github@v3
        name: Run Fortify Scan
        id: fortify_scan
        env:
          SSC_URL: ${{ vars.SSC_URL }}
          SSC_TOKEN: ${{ secrets.SSC_TOKEN }}
          SC_SAST_TOKEN: ${{ secrets.SC_SAST_TOKEN }}
          # SSC_APPVERSION: MyApp:main  # Optional: defaults to repo:branch
      # - name: Upload Fortify debug artifacts (custom)
      #   if: ${{ always() && steps.fortify_scan.outputs.upload-debug-artifacts == 'true' }}
      #   uses: <custom upload action>
      #   with:
      #     path: ${{ steps.fortify_scan.outputs.debug-artifacts-dir }}
```

#### Custom workflow

```yaml
name: Custom Fortify Workflow
on: [push]

jobs:
  custom-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: fortify/github-action/setup@v3
        with:
          fcli: bootstrapped               # Set up bootstrapped fcli version. May also specify specific version, but
                                           # then fcli may be downloaded twice (bootstrap version and requested version).
        env:
          FCLI_BOOTSTRAP_VERSION: v3.15.0  # Defaults to latest v3.x.y, pin to specific version for stability
      - name: Run custom fcli commands
        run: |
          fcli fod session login ...
          # Your custom workflow here
          fcli fod session logout ...
```

### Detailed Documentation

Given that these GitHub Actions are just thin wrappers around `@fortify/setup` and `fcli`, detailed usage documentation is available on the fcli documentation website:

* [`fortify/github-action` for OpenText Application Security Code (Fortify on Demand)]({{var:fcli-doc-base-url}}/ci/github/{{var:action-doc-version}}/ast-action-fod.html)
* [`fortify/github-action` for OpenText Software Security Center (Fortify SSC)]({{var:fcli-doc-base-url}}/ci/github/{{var:action-doc-version}}/ast-action-ssc.html)
* [`fortify/github-action/setup`]({{var:fcli-doc-base-url}}/ci/github/{{var:action-doc-version}}/setup-action.html)


