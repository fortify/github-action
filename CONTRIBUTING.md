# Contributing to Fortify GitHub Actions

## Contribution Agreement

Contributions like bug fixes and enhancements may be submitted through Pull Requests on this repository. Before we can accept 3<sup>rd</sup>-party pull requests, you will first need to sign and submit the [Contribution Agreement](https://github.com/fortify/repo-resources/raw/main/static/Open%20Source%20Contribution%20Agreement%20Jan2020v1.pdf). Please make sure to mention your GitHub username when submitting the form, to allow us to verify that the author of a pull request has accepted this agreement. 


<!-- START-INCLUDE:repo-devinfo.md -->

## Information for Developers

### Repository initialization
After cloning this repository, please run ./configure.sh to install npm modules and configure git hooks. When adding a new NodeJS-based action, you'll need to update `<repo-root>/configure.sh` to add the action directory to the for-loop.

<!-- END-INCLUDE:repo-devinfo.md -->


---

*[This document was auto-generated from CONTRIBUTING.template.md; do not edit by hand](https://github.com/fortify/shared-doc-resources/blob/main/USAGE.md)*
