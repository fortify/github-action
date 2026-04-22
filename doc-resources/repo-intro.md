The `fortify/github-action` GitHub Action allows for easy integration of OpenText Fortify Application Security Testing (AST) into your GitHub Action workflows by bootstrapping the latest [fcli v3 release](https://github.com/fortify/fcli/releases/v3) using the [`@fortify/setup` NPM component](https://www.npmjs.com/package/@fortify/setup), and then running the `fcli action run ci` command. 

As such, this GitHub Action automatically benefits from new features and bug fixes as they are introduced in fcli, although there are options to use a fixed fcli version in case you need more stability. At the time of writing, the fcli `ci` action provides out-of-the-box support for Static Application Security Testing (SAST) and Software Composition Analysis (SCA); support for Dynamic or Mobile Application Security Testing (DAST & MAST) may be added in the future.

Apart from the top-level `fortify/github-action` (and related `fortify/github-action/with-github-artifacts`, `fortify/github-action/with-ghes-artifacts`, and `fortify/github-action/without-artifacts` sub-actions) for running the fcli-based `ci` workflow, this repository also provides the `fortify/github-action/setup` GitHub Action. This `setup` action allows for setting up fcli and other Fortify tools like ScanCentral Client for use in a custom GitHub Actions workflow, for example for implementing a fully customized AST scan workflow or some other automation workflow that needs to interact with Fortify products.

{{include:repo-usage-text.md}}


