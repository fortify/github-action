# fortify/github-action@v1 


<!-- START-INCLUDE:p.marketing-intro.md -->

[Fortify Application Security](https://www.microfocus.com/en-us/solutions/application-security) provides your team with solutions to empower [DevSecOps](https://www.microfocus.com/en-us/cyberres/use-cases/devsecops) practices, enable [cloud transformation](https://www.microfocus.com/en-us/cyberres/use-cases/cloud-transformation), and secure your [software supply chain](https://www.microfocus.com/en-us/cyberres/use-cases/securing-the-software-supply-chain). As the sole Code Security solution with over two decades of expertise and acknowledged as a market leader by all major analysts, Fortify delivers the most adaptable, precise, and scalable AppSec platform available, supporting the breadth of tech you use and integrated into your preferred toolchain. We firmly believe that your great code [demands great security](https://www.microfocus.com/cyberres/application-security/developer-security), and with Fortify, go beyond 'check the box' security to achieve that.

<!-- END-INCLUDE:p.marketing-intro.md -->



<!-- START-INCLUDE:repo-readme.md -->

The [Fortify github-action repository]({{repo-url}}) hosts various Fortify-related GitHub Actions as listed in the sections below.

**Fortify on Demand**

* [`fortify/github-action@v1`](#primary-action)  
  For now, this action provides the same functionality as the `fod-sast-scan` action listed below. Future versions may add support for running other types of scans or performing other FoD actions.
* [`fortify/github-action/fod-sast-scan@v1`](#fod-sast-scan-action)  
  Package source code, submit SAST scan request to Fortify on Demand, optionally wait for completion and export results back to the GitHub Security dashboard.
* [`fortify/github-action/package@v1`](#package-action)  
  Package source code for running a SAST scan, using the latest version of ScanCentral Client.
* [`fortify/github-action/fod-export@v1`](#fod-export-action)  
  Export vulnerability data from Fortify on Demand to the GitHub Security dashboard.
* [`fortify/github-action/setup@v1`](#setup-action)  
  Install various Fortify tools like [fcli](https://github.com/fortify/fcli), [ScanCentral Client](https://www.microfocus.com/documentation/fortify-software-security-center/2310/SC_SAST_Help_23.1.0/index.htm#A_Clients.htm), [FortifyVulnerabilityExporter](https://github.com/fortify/FortifyVulnerabilityExporter) and [FortifyBugTrackerUtility](https://github.com/fortify-ps/FortifyBugTrackerUtility) for use in your pipeline
  
**SSC / ScanCentral SAST/ ScanCentral DAST**

* [`fortify/github-action@v1`](#primary-action)  
  For now, this action provides the same functionality as the `ssc-sast-scan` action listed below. Future versions may add support for running other types of scans or performing other SSC / ScanCentral actions.
* [`fortify/github-action/sc-sast-scan@v1`](#sc-sast-scan-action)  
  Package source code, submit SAST scan request to ScanCentral SAST, optionally wait for completion and export results back to the GitHub Security dashboard.
* [`fortify/github-action/package@v1`](#package-action)  
  Package source code for running a SAST scan, using the latest version of ScanCentral Client.
* [`fortify/github-action/ssc-export@v1`](#ssc-export-action)  
  Export vulnerability data from Fortify Software Security Center (SSC) to the GitHub Security dashboard.
* [`fortify/github-action/setup@v1`](#setup-action)  
  Install various Fortify tools like [fcli](https://github.com/fortify/fcli), [ScanCentral Client](https://www.microfocus.com/documentation/fortify-software-security-center/2310/SC_SAST_Help_23.1.0/index.htm#A_Clients.htm), [FortifyVulnerabilityExporter](https://github.com/fortify/FortifyVulnerabilityExporter) and [FortifyBugTrackerUtility](https://github.com/fortify-ps/FortifyBugTrackerUtility) for use in your pipeline

## Primary action

The primary `fortify/github-action@v1` currently allows for running SAST scans on either Fortify on Demand or ScanCentral SAST; future versions may add support for other activities like running DAST scans. Which activities to perform is controlled through action inputs, the input for those activities is provided through environment variables.

### Action inputs

**`sast-scan`**    
If not specified or when set to false, no SAST scan will be performed. When set to true, the action will run a SAST scan on either Fortify on Demand (if the FOD_URL environment variable has been specified), or on ScanCentral SAST (if the SSC_URL environment variable has been specified). This includes packaging the source code, running the scan, and optionally reporting scan results back into GitHub. 

To successfully perform the SAST scan, additional environment variables will need to be configured on the action as listed in these sections:

* Fortify on Demand: [`fortify/github-action/fod-sast-scan@v1`](#fod-sast-scan-action)
* ScanCentral SAST: [`fortify/github-action/sc-sast-scan@v1`](#sc-sast-scan-action)

### Sample workflows

TODO

## setup action


<!-- START-INCLUDE:action-setup.md -->

This action allows for setting up the Fortify tools listed below. Which tools and which versions to install, and whether to add the tool bin-directories to the system path, is controlled through action inputs as listed in the next section.

* [fcli](https://github.com/fortify/fcli)
* [ScanCentral Client](https://www.microfocus.com/documentation/fortify-software-security-center/2310/SC_SAST_Help_23.1.0/index.htm#A_Clients.htm)
* [FoDUploader](https://github.com/fod-dev/fod-uploader-java)
* [FortifyVulnerabilityExporter](https://github.com/fortify/FortifyVulnerabilityExporter)
* [FortifyBugTrackerUtility](https://github.com/fortify-ps/FortifyBugTrackerUtility)

### Action inputs

**`export-path`**    
Whether to add the installed tools to the system PATH variable. Allowed values: `true` (default) or `false`

**`fcli`**    
The fcli version to install. Allowed values: `skip` (default value, do not install fcli), `latest`, or specific version number. Supports semantic versioning, for example `v2` will install the latest known `2.x.y` version. Version may be specified either with or without the `v` prefix, for example `v2.0.0` and `2.0.0` are semantically the same.

**`sc-client`**    
The ScanCentral Client version to install. Allowed values: `skip` (default value, do not install), `latest`, or specific version number. Supports semantic versioning, for example `23.1` will install the latest known `23.1.y` patch version. Version may be specified either with or without the `v` prefix, for example `v23.1` and `23.1` are semantically the same.

**`fod-uploader`**    
The FoDUploader version to install. Allowed values: `skip` (default value, do not install), `latest`, or specific version number. Supports semantic versioning, for example `v5` will install the latest known `5.x.y` version. Version may be specified either with or without the `v` prefix, for example `v5.4.0` and `5.4.0` are semantically the same.

**`vuln-exporter`**    
The FortifyVulnerabilityExporter version to install. Allowed values: `skip` (default value, do not install), `latest`, or specific version number. Supports semantic versioning, for example `v2` will install the latest known `2.x.y` version. Version may be specified either with or without the `v` prefix, for example `v2.0.4` and `2.0.4` are semantically the same.

**`bugtracker-utility`**    
The FortifyBugTrackerUtility version to install. Allowed values: `skip` (default value, do not install), `latest`, or specific version number. Supports semantic versioning, for example `v4` will install the latest known `4.x` version. Version may be specified either with or without the `v` prefix, for example `v4.12` and `4.12` are semantically the same.

### Action outputs

For each tool being installed, the action outputs several environment variables for use by later workflow steps.

**`PATH`**    
If the `export-path` action input was set to `true` (default), the bin-directory of the installed tool will be added to the workflow `PATH` environment variable.

**`<TOOL_NAME>_INSTALL_DIR`**    
Directory where the corresponding tool was installed. `<TOOL_NAME>` corresponds to the various action inputs, but converted to uppercase and dashes replaced by underscore, for example `FOD_UPLOADER_INSTALL_DIR`.

**`<TOOL_NAME>_BIN_DIR`**    
Bin-directory that holds the executables for the corresponding tool. `<TOOL_NAME>` corresponds to the various action inputs, but converted to uppercase and dashes replaced by underscore, for example `FOD_UPLOADER_BIN_DIR`.

**`<TOOL_NAME>_CMD`**    
Fully qualified path to the (primary) executable/script for the corresponding tool. `<TOOL_NAME>` corresponds to the various action inputs, but converted to uppercase and dashes replaced by underscore, for example `FOD_UPLOADER_CMD`.

### Sample usage

The sample workflow below demonstrates how to configure the action for installing the various Fortify tools and how to run these tools. Some notes:

* The `export-path` and `bugtracker-utility` inputs are set to their default values, and thus could have been omitted.
* The action supports semantic versioning, so the `vuln-exporter` input will install the latest known v2.x.y version of FortifyVulnerabilityExporter.

```yaml
    steps:    
      - name: Setup Fortify tools
        uses: fortify/github-action/setup@v1
        with:
          export-path: true
          fcli: latest
          sc-client: 23.1.0
          fod-uploader: latest
          vuln-exporter: v2
          bugtracker-utility: skip
      - name: Run fcli from PATH
        run: fcli -V
      - name: Run fcli using FCLI_CMD environment variable
        run: ${FCLI_CMD} -V
```

<!-- END-INCLUDE:action-setup.md -->


## package action


<!-- START-INCLUDE:action-package.md -->

This action packages application source code using [ScanCentral Client](https://www.microfocus.com/documentation/fortify-software-security-center/2310/SC_SAST_Help_23.1.0/index.htm#A_Clients.htm). The output package is saved as `package.zip`.

### Action environment variable inputs


<!-- START-INCLUDE:env-package.md -->

**`EXTRA_PACKAGE_OPTS`**    
Optional: By default, this action runs `scancentral package -o package.zip`. The `EXTRA_PACKAGE_OPTS` environment variable can be used to specify additional packaging options like `-bt none` to disable automatic build tool detection, or `-oss` to collect additional files for an open-source scan (FoD only).

<!-- END-INCLUDE:env-package.md -->


### Sample usage

The sample workflow below demonstrates how to configure the action for running a SAST scan on FoD.

```yaml
    steps:  
      - name: Check out source code
        uses: actions/checkout@v4  
      - name: Package source code
        uses: fortify/github-action/package@v1
        env:
          EXTRA_PACKAGE_OPTS: -bt mvn
```

<!-- END-INCLUDE:action-package.md -->


## fod-sast-scan action


<!-- START-INCLUDE:action-fod-sast-scan.md -->

This action performs a SAST scan (optionally combined with an open-source scan) on Fortify on Demand, consisting of the following steps:

* Login to FoD
* Package application source code using ScanCentral Client
* Submit the source code package to be scanned to FoD
* Optionally wait for the scan to complete
* Optionally export scan results to the GitHub Code Scanning dashboard

Before running this action, please ensure that the appropriate release has been created on FoD and has been configured for SAST scans. Future versions of this action may add support for automating app/release creation and scan setup. If Open Source scanning has been enabled in the FoD SAST scan configuration, you'll need to pass the `-oss` option through the `EXTRA_PACKAGE_OPTS` environment variable.

### Action environment variable inputs


<!-- START-INCLUDE:env-fod-sast-scan.md -->



<!-- START-INCLUDE:env-fod-login.md -->


<!-- START-INCLUDE:env-fod-connection.md -->

**`FOD_URL`**    
Required: Fortify on Demand URL, for example https://ams.fortify.com

**`FOD_CLIENT_ID` & `FOD_CLIENT_SECRET`**   
Required when authenticating with an API key: FoD Client ID (API key) and Secret (API secret)

**`FOD_TENANT`, `FOD_USER` & `FOD_PASSWORD`**   
Required when authenticating with user credentials: FoD tenant, user and password. It's recommended to use a Personal Access Token instead of an actual user password.

<!-- END-INCLUDE:env-fod-connection.md -->


**`EXTRA_FOD_LOGIN_OPTS`**    
Optional: Extra FoD login options, for example for disabling SSL checks or changing connection time-outs; see [`fcli fod session login` documentation](https://fortify.github.io/fcli/v2.0.0//manpage/fcli-fod-session-login.html)

<!-- END-INCLUDE:env-fod-login.md -->



<!-- START-INCLUDE:env-fod-release.md -->

**`FOD_RELEASE`**    
Required: Fortify on Demand release to use with this action. This can be specified either as a numeric release id, `<app>:<release>` (for non-microservices applications) or `<app>:<microservice>:<release>` (for microservices applications).

<!-- END-INCLUDE:env-fod-release.md -->



<!-- START-INCLUDE:env-package.md -->

**`EXTRA_PACKAGE_OPTS`**    
Optional: By default, this action runs `scancentral package -o package.zip`. The `EXTRA_PACKAGE_OPTS` environment variable can be used to specify additional packaging options like `-bt none` to disable automatic build tool detection, or `-oss` to collect additional files for an open-source scan (FoD only).

<!-- END-INCLUDE:env-package.md -->


**`EXTRA_FOD_SAST_SCAN_OPTS`**    
Optional: Extra FoD SAST scan options; see [`fcli fod sast-scan start` documentation](https://fortify.github.io/fcli/v2.0.0//manpage/fcli-fod-sast-scan-start.html)

**`DO_WAIT`**    
Optional: By default, this action will not wait until the scan has been completed. To have the workflow wait until the scan has been completed, set the `DO_WAIT` environment variable to `true`. Note that `DO_WAIT` is implied if `DO_EXPORT` is set to `true`; see below.

**`DO_EXPORT`**    
Optional: If set to `true`, this action will export scan results to the GitHub Security Code Scanning dashboard.

<!-- END-INCLUDE:env-fod-sast-scan.md -->


### Sample usage

The sample workflow below demonstrates how to configure the action for running a SAST scan on FoD.

```yaml
    steps:    
      - name: Check out source code
        uses: actions/checkout@v4  
      - name: Run FoD SAST Scan
        uses: fortify/github-action/fod-sast-scan@v1
        env:
          FOD_URL: https://ams.fortify.com
          FOD_TENANT: ${{secrets.FOD_TENANT}}
          FOD_USER: ${{secrets.FOD_USER}}
          FOD_PASSWORD: ${{secrets.FOD_PAT}}
          EXTRA_FOD_LOGIN_OPTS: --socket-timeout=60s
          FOD_RELEASE: MyApp:MyRelease
          EXTRA_PACKAGE_OPTS: -oss -bt gradle
          # DO_WAIT: true # Ignored due to DO_EXPORT below
          DO_EXPORT: true
```

<!-- END-INCLUDE:action-fod-sast-scan.md -->


## fod-export action


<!-- START-INCLUDE:action-fod-export.md -->

This action exports the latest vulnerability data from an FoD release to the GitHub Code Scanning dashboard.

### Action environment variable inputs


<!-- START-INCLUDE:env-fod-connection.md -->

**`FOD_URL`**    
Required: Fortify on Demand URL, for example https://ams.fortify.com

**`FOD_CLIENT_ID` & `FOD_CLIENT_SECRET`**   
Required when authenticating with an API key: FoD Client ID (API key) and Secret (API secret)

**`FOD_TENANT`, `FOD_USER` & `FOD_PASSWORD`**   
Required when authenticating with user credentials: FoD tenant, user and password. It's recommended to use a Personal Access Token instead of an actual user password.

<!-- END-INCLUDE:env-fod-connection.md -->



<!-- START-INCLUDE:env-fod-release.md -->

**`FOD_RELEASE`**    
Required: Fortify on Demand release to use with this action. This can be specified either as a numeric release id, `<app>:<release>` (for non-microservices applications) or `<app>:<microservice>:<release>` (for microservices applications).

<!-- END-INCLUDE:env-fod-release.md -->


### Sample usage

The sample workflow below demonstrates how to configure the action for exporting FoD vulnerability data to the GitHub Security Code Scanning dashboard.

```yaml
    steps:    
      - name: Export FoD vulnerability data to GitHub
        uses: fortify/github-action/fod-export@v1
        env:
          FOD_URL: https://ams.fortify.com
          FOD_TENANT: ${{secrets.FOD_TENANT}}
          FOD_USER: ${{secrets.FOD_USER}}
          FOD_PASSWORD: ${{secrets.FOD_PAT}}
          FOD_RELEASE: MyApp:MyRelease
```

<!-- END-INCLUDE:action-fod-export.md -->


## sc-sast-scan action


<!-- START-INCLUDE:action-sc-sast-scan.md -->

This action performs a SAST scan on ScanCentral SAST, consisting of the following steps:

* Login to ScanCentral SAST Controller
* Package application source code using ScanCentral Client
* Submit the source code package to be scanned to ScanCentral SAST Controller
* Optionally wait for the scan to complete
* Optionally export scan results to the GitHub Code Scanning dashboard

Before running this action, please ensure that the appropriate application version has been created on SSC. Future versions of this action may add support for automating application version creation.

### Action environment variable inputs


<!-- START-INCLUDE:env-sc-sast-scan.md -->



<!-- START-INCLUDE:env-sc-sast-login.md -->


<!-- START-INCLUDE:env-ssc-connection.md -->

**`SSC_URL`**    
(Required) Fortify Software Security Center URL, for example https://ssc.customer.fortifyhosted.net/

**`SSC_TOKEN`**   
Required when authenticating with an SSC token (recommended). Most actions should work fine with a `CIToken`.

**`SSC_USER` & `SSC_PASSWORD`**   
Required when authenticating with user credentials.

<!-- END-INCLUDE:env-ssc-connection.md -->


**`SC_SAST_CLIENT_AUTH_TOKEN`**   
Required: ScanCentral SAST Client Authentication Token for authenticating with ScanCentral SAST Controller.

**`EXTRA_SC_SAST_LOGIN_OPTS`**    
Optional: Extra ScanCentral SAST login options, for example for disabling SSL checks or changing connection time-outs; see [`fcli sc-sast session login` documentation](https://fortify.github.io/fcli/v2.0.0//manpage/fcli-sc-sast-session-login.html).

<!-- END-INCLUDE:env-sc-sast-login.md -->



<!-- START-INCLUDE:env-ssc-appversion.md -->

**`SSC_APPVERSION`**    
Required: Fortify SSC application version to use with this action. This can be specified either as a numeric application version id, or by providing application and version name in the format `<app>:<release>`.

<!-- END-INCLUDE:env-ssc-appversion.md -->



<!-- START-INCLUDE:env-package.md -->

**`EXTRA_PACKAGE_OPTS`**    
Optional: By default, this action runs `scancentral package -o package.zip`. The `EXTRA_PACKAGE_OPTS` environment variable can be used to specify additional packaging options like `-bt none` to disable automatic build tool detection, or `-oss` to collect additional files for an open-source scan (FoD only).

<!-- END-INCLUDE:env-package.md -->


**`EXTRA_SC_SAST_SCAN_OPTS`**    
Optional: Extra ScanCentral SAST scan options; see [`fcli sc-sast scan start` documentation](https://fortify.github.io/fcli/v2.0.0//manpage/fcli-sc-sast-scan-start.html)

**`DO_WAIT`**    
Optional: By default, this action will not wait until the scan has been completed. To have the workflow wait until the scan has been completed, set the `DO_WAIT` environment variable to `true`. Note that `DO_WAIT` is implied if `DO_EXPORT` is set to `true`; see below.

**`DO_EXPORT`**    
Optional: If set to `true`, this action will export scan results to the GitHub Security Code Scanning dashboard.

<!-- END-INCLUDE:env-sc-sast-scan.md -->


### Sample usage

The sample workflow below demonstrates how to configure the action for running a SAST scan on ScanCentral SAST.

```yaml
    steps:    
      - name: Check out source code
        uses: actions/checkout@v4  
      - name: Run ScanCentral SAST Scan
        uses: fortify/github-action/sc-sast-scan@v1
        env:
          SSC_URL: ${{secrets.SSC_URL}}
          SSC_TOKEN: ${{secrets.SSC_TOKEN}}
          SC_SAST_CLIENT_AUTH_TOKEN: ${{secrets.CLIENT_AUTH_TOKEN}}
          EXTRA_SC_SAST_LOGIN_OPTS: --socket-timeout=60s
          SSC_APPVERSION: MyApp:MyVersion
          EXTRA_PACKAGE_OPTS: -bt mvn
          # DO_WAIT: true # Ignored due to DO_EXPORT below
          DO_EXPORT: true
```

<!-- END-INCLUDE:action-sc-sast-scan.md -->


## ssc-export action


<!-- START-INCLUDE:action-ssc-export.md -->

This action exports the latest vulnerability data from an SSC application version to the GitHub Code Scanning dashboard.

### Action environment variable inputs


<!-- START-INCLUDE:env-ssc-connection.md -->

**`SSC_URL`**    
(Required) Fortify Software Security Center URL, for example https://ssc.customer.fortifyhosted.net/

**`SSC_TOKEN`**   
Required when authenticating with an SSC token (recommended). Most actions should work fine with a `CIToken`.

**`SSC_USER` & `SSC_PASSWORD`**   
Required when authenticating with user credentials.

<!-- END-INCLUDE:env-ssc-connection.md -->



<!-- START-INCLUDE:env-ssc-appversion.md -->

**`SSC_APPVERSION`**    
Required: Fortify SSC application version to use with this action. This can be specified either as a numeric application version id, or by providing application and version name in the format `<app>:<release>`.

<!-- END-INCLUDE:env-ssc-appversion.md -->


### Sample usage

The sample workflow below demonstrates how to configure the action for exporting FoD vulnerability data to the GitHub Security Code Scanning dashboard.

```yaml
    steps:    
      - name: Export SSC vulnerability data to GitHub
        uses: fortify/github-action/ssc-export@v1
        env:
          SSC_URL: ${{secrets.SSC_URL}}
          SSC_TOKEN: ${{secrets.SSC_TOKEN}}
          SSC_APPVERSION: MyApp:MyVersion
```

<!-- END-INCLUDE:action-ssc-export.md -->


<!-- END-INCLUDE:repo-readme.md -->



<!-- START-INCLUDE:h2.support.md -->

## Support

The only warranties for products and services of Open Text and its affiliates and licensors (“Open Text”) are as may be set forth in the express warranty statements accompanying such products and services. Nothing herein should be construed as constituting an additional warranty. Open Text shall not be liable for technical or editorial errors or omissions contained herein. The information contained herein is subject to change without notice.

The software is provided "as is" and is not supported through the regular OpenText Support channels. Support requests may be submitted through the [GitHub Issues](https://github.com/fortify-ps/github-action/issues) page for this repository. A (free) GitHub account is required to submit new issues or to comment on existing issues. 

Support requests created through the GitHub Issues page may include bug reports, enhancement requests and general usage questions. Please avoid creating duplicate issues by checking whether there is any existing issue, either open or closed, that already addresses your question, bug or enhancement request. If an issue already exists, please add a comment to provide additional details if applicable.

Support requests on the GitHub Issues page are handled on a best-effort basis; there is no guaranteed response time, no guarantee that reported bugs will be fixed, and no guarantee that enhancement requests will be implemented. If you require dedicated support for this and other Fortify software, please consider purchasing OpenText Fortify Professional Services. OpenText Fortify Professional Services can assist with general usage questions, integration of the software into your processes, and implementing customizations, bug fixes, and feature requests (subject to feasibility analysis). Please contact your OpenText Sales representative or fill in the [Professional Services Contact Form](https://www.microfocus.com/en-us/cyberres/contact/professional-services) to obtain more information on pricing and the services that OpenText Fortify Professional Services can provide.

<!-- END-INCLUDE:h2.support.md -->


---

*[This document was auto-generated; do not edit by hand](https://github.com/fortify/shared-doc-resources/blob/main/USAGE.md)*
