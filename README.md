# Fortify GitHub Action 


<!-- START-INCLUDE:p.marketing-intro.md -->

[Fortify Application Security](https://www.microfocus.com/en-us/solutions/application-security) provides your team with solutions to empower [DevSecOps](https://www.microfocus.com/en-us/cyberres/use-cases/devsecops) practices, enable [cloud transformation](https://www.microfocus.com/en-us/cyberres/use-cases/cloud-transformation), and secure your [software supply chain](https://www.microfocus.com/en-us/cyberres/use-cases/securing-the-software-supply-chain). As the sole Code Security solution with over two decades of expertise and acknowledged as a market leader by all major analysts, Fortify delivers the most adaptable, precise, and scalable AppSec platform available, supporting the breadth of tech you use and integrated into your preferred toolchain. We firmly believe that your great code [demands great security](https://www.microfocus.com/cyberres/application-security/developer-security), and with Fortify, go beyond 'check the box' security to achieve that.

<!-- END-INCLUDE:p.marketing-intro.md -->



<!-- START-INCLUDE:repo-intro.md -->

The `fortify/github-action` GitHub Action allows for easy integration of OpenText Fortify Application Security Testing (AST) into your GitHub Action workflows by bootstrapping the latest [fcli v3 release](https://github.com/fortify/fcli/releases/v3) using the [`@fortify/setup` NPM component](https://www.npmjs.com/package/@fortify/setup), and then running the `fcli action run ci` command. 

As such, this GitHub Action automatically benefits from new features and bug fixes as they are introduced in fcli, although there are options to use a fixed fcli version in case you need more stability. At the time of writing, the fcli `ci` action provides out-of-the-box support for Static Application Security Testing (SAST) and Software Composition Analysis (SCA); support for Dynamic or Mobile Application Security Testing (DAST & MAST) may be added in the future.

Apart from the top-level `fortify/github-action` for running the fcli-based `ci` workflow, this repository also provides the `fortify/github-action/setup` GitHub Action. This action allows for setting up fcli and other Fortify tools like ScanCentral Client for use in a custom GitHub Actions workflow, for example for implementing a fully customized AST scan workflow or some other automation workflow that needs to interact with Fortify products.


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
      - uses: fortify/github-action@v3       # Run Fortify scans
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
      - uses: fortify/github-action@v3       # Run Fortify scans
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

### Detailed Documentation

Given that these GitHub Actions are just thin wrappers around `@fortify/setup` and `fcli`, detailed usage documentation is available on the fcli documentation website:

* [`fortify/github-action` for OpenText Application Security Code (Fortify on Demand)](https://fortify.github.io/fcli/dev_doc.ci-updates/ci/github/v3.0.x/ast-action-fod.html)
* [`fortify/github-action` for OpenText Software Security Center (Fortify SSC)](https://fortify.github.io/fcli/dev_doc.ci-updates/ci/github/v3.0.x/ast-action-ssc.html)
* [`fortify/github-action/setup`](https://fortify.github.io/fcli/dev_doc.ci-updates/ci/github/v3.0.x/setup-action.html)

<!-- END-INCLUDE:repo-usage-text.md -->


<!-- END-INCLUDE:repo-intro.md -->


## Resources


<!-- START-INCLUDE:repo-resources.md -->

* **Contributing Guidelines**: [CONTRIBUTING.md](CONTRIBUTING.md)
* **Code of Conduct**: [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)
* **License**: [LICENSE.txt](LICENSE.txt)

<!-- END-INCLUDE:repo-resources.md -->



<!-- START-INCLUDE:h2.support.md -->

## Support

For general assistance, please join the [Fortify Community](https://community.opentext.com/cybersec/fortify/) to get tips and tricks from other users and the OpenText team.
 
OpenText customers can contact our world-class [support team](https://www.opentext.com/support/opentext-enterprise/) for questions, enhancement requests and bug reports. You can also raise questions and issues through your OpenText Fortify representative like Customer Success Manager or Technical Account Manager if applicable.

You may also consider raising questions or issues through the [GitHub Issues page](https://github.com/fortify/github-action/issues) (if available for this repository), providing public visibility and allowing anyone (including all contributors) to review and comment on your question or issue. Note that this requires a GitHub account, and given public visibility, you should refrain from posting any confidential data through this channel. 

<!-- END-INCLUDE:h2.support.md -->


---

*[This document was auto-generated from README.template.md; do not edit by hand](https://github.com/fortify/shared-doc-resources/blob/main/USAGE.md)*
