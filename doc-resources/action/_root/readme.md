This GitHub Action allows for easy integration of Fortify Application Security Testing (AST) into your GitHub Action workflows. It  provides out-of-the-box support for Static Application Security Testing (SAST) and Software Composition Analysis (SCA); support for Dynamic or Mobile Application Security Testing (DAST & MAST) may be added in the future. Apart from utilizing the standard scan workflows provided by this GitHub Action, you may also choose to utilize the various building blocks to implement custom workflows, which can be either customized SAST or SCA workflows, or your own DAST or MAST workflows.

The following sections describe these topics in more detail:

* [Prerequisites](#prerequisites)
* [Application Security Testing with Fortify on Demand](#application-security-testing-with-fortify-on-demand)
* [Application Security Testing with SSC/ScanCentral](#application-security-testing-with-ssc-scancentral)
* [Building blocks for custom workflows](#building-blocks-for-custom-workflows)

{{include:action/generic/prerequisites-h2.md}}

## Application Security Testing with Fortify on Demand

The standard workflow provided by this GitHub Action allows for running a Static scan and optional open-source scan (software composition analysis) on Fortify on Demand. The following sample snippet demonstrates how to invoke this GitHub Action from a GitHub Actions workflow:

```yaml
    steps:    
      - name: Check out source code
        uses: actions/checkout@v4  
      - name: Run FoD SAST Scan
        uses: fortify/github-action@{{var:action-major-version}}
        with:
          sast-scan: true
          debricked-sca-scan: true
        env:
{{include:action/generic/fod/nocomments.snippet-fod-login.md}}
{{include:action/generic/fod/nocomments.snippet-fod-release.md}}
{{include:action/generic/nocomments.snippet-setup.md}}
{{include:action/package/nocomments.snippet-package-extra-opts.md}}
{{include:action/fod-sast-scan/nocomments.snippet-fod-sast-scan.md}}
{{include:action/generic/nocomments.snippet-do-wait.md}}
{{include:action/generic/nocomments.snippet-policy-check.md}}
{{include:action/generic/nocomments.snippet-job-summary.md}}
{{include:action/generic/nocomments.snippet-pr-comment.md}}
{{include:action/generic/nocomments.snippet-export-optional.md}}
{{include:action/setup/nocomments.snippet-tool-definitions.md}}
```

{{include:action/generic/nocomments.input-section-and-table-header.md}}
| sast&#8209;scan | If set to `true`, run a static scan. If not specified or set to `false`, the action will run neither static or open-source scan (independent of `debricked-sca-scan` setting), as open-source scans are currently only run in combination with a static scan. |
| debricked&#8209;sca&#8209;scan | Configure the static scan to also run an open-source scan. Depending on FoD configuration, this may be either a Debricked or a Sonatype scan. Effectively, this adds dependency data to the scan payload, and enables the open-source scan setting in the FoD scan configuration. Note that any existing FoD scan configuration will not be updated, so if the scan has already been configured in FoD, an open-source scan will only be performed if previously enabled in the existing scan configuration. |

{{include:action/generic/nocomments.env-section-and-table-header.md}}
{{include:action/generic/fod/nocomments.env-fod-login.md}}
{{include:action/generic/fod/nocomments.env-fod-release.md}}
{{include:action/fod-sast-scan/nocomments.env-setup.md}}
{{include:action/package/nocomments.env-package-extra-opts.md}}
{{include:action/fod-sast-scan/nocomments.env-fod-sast-scan.md}}
{{include:action/generic/nocomments.env-do-wait.md}}
{{include:action/fod-sast-scan/nocomments.env-policy-check.md}}
{{include:action/fod-sast-scan/nocomments.env-job-summary.md}}
{{include:action/fod-export/nocomments.env-export-optional.md}}
{{include:action/fod-sast-scan/nocomments.env-pr-comment.md}}
{{include:action/setup/nocomments.env-tool-definitions.md}}

{{include:action/generic/fod/fod-fcli-actions.md}}

{{include:action/generic/fod/fod-pr.md}}

## Application Security Testing with SSC/ScanCentral

The standard workflow provided by this GitHub Action allows for running a static scan on ScanCentral SAST and/or running software composition analysis on Debricked. The following sample snippet demonstrates how to invoke this GitHub Action from a GitHub Actions workflow:

```yaml
    steps:    
      - name: Check out source code
        uses: actions/checkout@v4  
      - name: Run FoD SAST Scan
        uses: fortify/github-action@{{var:action-major-version}}
        with:
          sast-scan: true
          debricked-sca-scan: true
        env:
{{include:action/generic/sc-sast/nocomments.snippet-ssc-and-sc-sast-login.md}}
{{include:action/generic/debricked/nocomments.snippet-debricked-token.md}}
{{include:action/generic/ssc/nocomments.snippet-ssc-appversion.md}}
{{include:action/generic/nocomments.snippet-setup.md}}
{{include:action/package/nocomments.snippet-package-extra-opts.md}}
{{include:action/sc-sast-scan/nocomments.snippet-sc-sast-scan.md}}
{{include:action/generic/nocomments.snippet-do-wait.md}}
{{include:action/generic/nocomments.snippet-policy-check.md}}
{{include:action/generic/nocomments.snippet-job-summary.md}}
{{include:action/generic/nocomments.snippet-pr-comment.md}}
{{include:action/generic/nocomments.snippet-export-optional.md}}
{{include:action/setup/nocomments.snippet-tool-definitions.md}}
```

{{include:action/generic/nocomments.input-section-and-table-header.md}}
| sast&#8209;scan | If set to `true`, run a static scan. If not specified or set to `false`, no static scan will be run. |
| debricked&#8209;sca&#8209;scan | If set to `true`, run Debricked Software Composition Analysis. If not specified or set to `false`, no software composition analysis will be performed. |

{{include:action/generic/nocomments.env-section-and-table-header.md}}
{{include:action/generic/sc-sast/nocomments.env-ssc-and-sc-sast-login.md}}
{{include:action/generic/debricked/nocomments.env-debricked-token.md}}
{{include:action/generic/ssc/nocomments.env-ssc-appversion.md}}
{{include:action/sc-sast-scan/nocomments.env-setup.md}}
{{include:action/package/nocomments.env-package-extra-opts.md}}
{{include:action/sc-sast-scan/nocomments.env-sc-sast-scan.md}}
{{include:action/generic/nocomments.env-do-wait.md}}
{{include:action/sc-sast-scan/nocomments.env-policy-check.md}}
{{include:action/sc-sast-scan/nocomments.env-job-summary.md}}
{{include:action/ssc-export/nocomments.env-export-optional.md}}
{{include:action/sc-sast-scan/nocomments.env-pr-comment.md}}
{{include:action/setup/nocomments.env-tool-definitions.md}}

{{include:action/generic/ssc/ssc-fcli-actions.md}}

{{include:action/generic/ssc/ssc-pr.md}}


## Building blocks for custom workflows

This GitHub Action provides a lot of flexibility with regards to what operations to run as controlled through the various `DO_*` environment variables, and also allows for customizing some of these operations by utilizing custom fcli actions through the `*_ACTION` environment variables. However, there may be situations where the standard workflow provided by this GitHub Action doesn't meet your needs, for example if you need to run Dynamic or Mobile scans.

The modular implementation of this GitHub Action allows for implementing custom workflows based on the various re-usable sub-actions available in this repository. The following sub-actions that can be used as building blocks for custom workflows are currently available for public use:

| Action | Description |
| :---   | :---        |
| [fortify/github&#8209;action/setup]({{var:repo-url}}/tree/{{var:action-major-version}}/setup#readme) | This sub-action allows for installing various Fortify tools like fcli or ScanCentral Client for later use in your GitHub Actions workflow. This allows for implementing fully customized workflows that can easily utilize the various Fortify tools to interact with Fortify products and Debricked. |
| [fortify/github&#8209;action/package]({{var:repo-url}}/tree/{{var:action-major-version}}/package#readme) | This sub-action can be used to easily package your source code for static scans, with the action handling low-level details like installation of ScanCentral Client and required Java version. |
| [fortify/github&#8209;action/fod&#8209;export]({{var:repo-url}}/tree/{{var:action-major-version}}/fod-export#readme) | This sub-action allows for exporting vulnerability data from FoD to the GitHub Security dashboard, with the action handling low-level details like installing the necessary Fortify tools, exporting the vulnerability data, and uploading this data to GitHub. |
| [fortify/github&#8209;action/ssc&#8209;export]({{var:repo-url}}/tree/{{var:action-major-version}}/ssc-export#readme) | This sub-action allows for exporting vulnerability data from SSC to the GitHub Security dashboard, with the action handling low-level details like installing the necessary Fortify tools, exporting the vulnerability data, and uploading this data to GitHub. |

The `fortify/github-action` repository also provides the publicly available sub-actions listed in the table below, but these provide the full scan workflows as provided by this GitHub Action, with the top-level `fortify/github-action` simply invoking one of these sub-actions based on action inputs and environment variables. As such, these sub-actions are not meant to provide re-usable building blocks, but it may be useful to look at the implementations of these sub-actions if you want to re-use any of their functionality in your custom workflows.

| Action | Description |
| :---   | :---        |
| [fortify/github&#8209;action/fod&#8209;sast&#8209;scan]({{var:repo-url}}/tree/{{var:action-major-version}}/fod-sast-scan#readme) | Run a Fortify on Demand SAST scan. |
| [fortify/github&#8209;action/sc&#8209;sast&#8209;scan]({{var:repo-url}}/tree/{{var:action-major-version}}/sc-sast-scan#readme) | Run a ScanCentral SAST scan and optional Debricked scan. |
| [fortify/github&#8209;action/ssc&#8209;debricked&#8209;scan]({{var:repo-url}}/tree/{{var:action-major-version}}/ssc-debricked-scan#readme) | Run a Debricked-only scan and import scan results into SSC. |

These actions utilize the re-usable building blocks mentioned above, in combination with several sub-actions that are meant for internal use only. However, the source code of these internal-only sub-actions is publicly available, allowing you to gain a better understanding of how these are used to implement the functionality provided by `fortify/github-action` and potentially re-use some of the ideas or code in your custom workflows. In particular, the `bash` scripts provided by the [`fortify/github-action/internal/run-script`]({{var:repo-url}}/tree/{{var:action-major-version}}/internal/run-script/scripts) provide some of the core functionality provided by this GitHub Action.
