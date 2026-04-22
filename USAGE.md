
<!-- START-INCLUDE:repo-usage.md -->

## Usage instructions


<!-- START-INCLUDE:repo-usage-text.md -->

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
        # Bootstrap fcli, run the fcli-based Fortify CI workflow, and upload any debug artifacts
        # to GitHub artifact storage (see artifact storage section below for alternative options)
      - uses: fortify/github-action@v3
        name: Run Fortify Scan
        env:
          FOD_URL: ${{ vars.FOD_URL }}
          FOD_CLIENT_ID: ${{ secrets.FOD_CLIENT_ID }}
          FOD_CLIENT_SECRET: ${{ secrets.FOD_CLIENT_SECRET }}
          # FOD_RELEASE: MyApp:main        # Optional: defaults to repo:branch
          # FCLI_BOOTSTRAP_VERSION: v3.15  # Optional if you prefer stability over latest
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
        # Bootstrap fcli, run the fcli-based Fortify CI workflow, and upload any debug artifacts
        # to GitHub artifact storage (see artifact storage section below for alternative options)
      - uses: fortify/github-action@v3
        name: Run Fortify Scan
        env:
          SSC_URL: ${{ vars.SSC_URL }}
          SSC_TOKEN: ${{ secrets.SSC_TOKEN }}
          SC_SAST_TOKEN: ${{ secrets.SC_SAST_TOKEN }}
          # SSC_APPVERSION: MyApp:main  # Optional: defaults to repo:branch
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

### Artifact storage

If debugging is enabled (either via the `debug: true` action input or by re-running the workflow with GitHub's "Enable debug logging" option), debug artifacts are collected during the scan and uploaded after the scan completes.

The top-level `fortify/github-action` action uploads debug artifacts to GitHub.com artifact storage using `actions/upload-artifact@v7`. If this doesn't match your environment, the following sub-actions provide alternatives:

| Sub-action | Description |
|---|---|
| `fortify/github-action` | Default. Uploads to GitHub.com artifact storage using `actions/upload-artifact@v7`. |
| `fortify/github-action/with-github-artifacts` | Identical to the default; use this when you want to make the artifact storage choice explicit in your workflow. |
| `fortify/github-action/with-ghes-artifacts` | Uploads to GHES-compatible artifact storage using `actions/upload-artifact@v3`. Use this on GitHub Enterprise Server. |
| `fortify/github-action/without-artifacts` | Does not upload artifacts. Exposes `upload-debug-artifacts` and `debug-artifacts-dir` outputs so you can add your own upload step targeting any storage backend. |

### Detailed Documentation

Given that these GitHub Actions are just thin wrappers around `@fortify/setup` and `fcli`, detailed usage documentation is available on the fcli documentation website:

* `fortify/github-action` (default — GitHub.com artifact upload): [FoD](https://fortify.github.io/fcli/v3/ci/github/v3.1.x/ast-action-fod.html) | [SSC](https://fortify.github.io/fcli/v3/ci/github/v3.1.x/ast-action-ssc.html)
* `fortify/github-action/with-github-artifacts` (explicit GitHub.com artifact upload): [FoD](https://fortify.github.io/fcli/v3/ci/github/v3.1.x/ast-action-with-github-artifacts-fod.html) | [SSC](https://fortify.github.io/fcli/v3/ci/github/v3.1.x/ast-action-with-github-artifacts-ssc.html)
* `fortify/github-action/with-ghes-artifacts` (GHES-compatible artifact upload): [FoD](https://fortify.github.io/fcli/v3/ci/github/v3.1.x/ast-action-with-ghes-artifacts-fod.html) | [SSC](https://fortify.github.io/fcli/v3/ci/github/v3.1.x/ast-action-with-ghes-artifacts-ssc.html)
* `fortify/github-action/without-artifacts` (custom artifact upload): [FoD](https://fortify.github.io/fcli/v3/ci/github/v3.1.x/ast-action-without-artifacts-fod.html) | [SSC](https://fortify.github.io/fcli/v3/ci/github/v3.1.x/ast-action-without-artifacts-ssc.html)
* [`fortify/github-action/setup`](https://fortify.github.io/fcli/v3/ci/github/v3.1.x/setup-action.html)

<!-- END-INCLUDE:repo-usage-text.md -->


<!-- END-INCLUDE:repo-usage.md -->


---

*[This document was auto-generated from USAGE.template.md; do not edit by hand](https://github.com/fortify/shared-doc-resources/blob/main/USAGE.md)*
