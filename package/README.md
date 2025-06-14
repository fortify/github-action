# fortify/github-action/package@v2 


<!-- START-INCLUDE:p.marketing-intro.md -->

[Fortify Application Security](https://www.microfocus.com/en-us/solutions/application-security) provides your team with solutions to empower [DevSecOps](https://www.microfocus.com/en-us/cyberres/use-cases/devsecops) practices, enable [cloud transformation](https://www.microfocus.com/en-us/cyberres/use-cases/cloud-transformation), and secure your [software supply chain](https://www.microfocus.com/en-us/cyberres/use-cases/securing-the-software-supply-chain). As the sole Code Security solution with over two decades of expertise and acknowledged as a market leader by all major analysts, Fortify delivers the most adaptable, precise, and scalable AppSec platform available, supporting the breadth of tech you use and integrated into your preferred toolchain. We firmly believe that your great code [demands great security](https://www.microfocus.com/cyberres/application-security/developer-security), and with Fortify, go beyond 'check the box' security to achieve that.

<!-- END-INCLUDE:p.marketing-intro.md -->



<!-- START-INCLUDE:action/package/readme.md -->

This action packages application source code using [ScanCentral Client](https://www.microfocus.com/documentation/fortify-software-security-center/2520/sc-sast-ugd-html-25.2.0/index.htm#cli/package-cmd.htm). The output package is saved as `package.zip`.


<!-- START-INCLUDE:action/_generic/prerequisites-h3.md -->

### Prerequisites


<!-- START-INCLUDE:action/_generic/prerequisites.md -->

This action assumes the standard software packages as provided by GitHub-hosted runners to be available. If you are using self-hosted runners, you may need to install some of these software packages in order to successfully use this action. In particular, not having the following software installed is known to cause issues when running `fortify/github-action` or one of its sub-actions:

* Node.js
* Visual C++ Redistributable (Windows-based runners only)
* Bash shell   
  If using Windows runners, this must be a Windows-based `bash` variant, for example as provided by MSYS2. You must make sure that this Windows-based `bash` variant is used for `run` steps that specify `shell: bash`. Actions will fail if the GitHub runner executes `bash` commands on the WSL-provided `bash.exe`

<!-- END-INCLUDE:action/_generic/prerequisites.md -->


<!-- END-INCLUDE:action/_generic/prerequisites-h3.md -->


### Sample usage

The sample workflow below demonstrates how to configure the action packaging application source code.

```yaml
    steps:  
      - name: Check out source code
        uses: actions/checkout@v4  
      - name: Package source code
        uses: fortify/github-action/package@v2
        env:
          # SC_CLIENT_VERSION: 24.4.1
          # DO_PACKAGE_DEBUG: true
          # PACKAGE_EXTRA_OPTS: -oss -bt mvn
          # TOOL_DEFINITIONS: https://ftfy.mycompany.com/tool-definitions/v1/tool-definitions.yaml.zip
```

### Action environment variable inputs

This section lists the environment variables that can be specified in the `env:` clause for this GitHub Action. Any environment variables marked in **bold** are required.

| Environment variable | Description |
| :--- | :--- |
| SC_CLIENT_VERSION | By default, this action uses ScanCentral Client 25.2.0 for packaging. This environment variable allows for overriding the ScanCentral Client version used for packaging. |
|DO_PACKAGE_DEBUG| If set to true, this will enable the `-debug` option on the `scancentral` command, and store both ScanCentral logs and the `package.zip` file as job artifacts.|
|PACKAGE_EXTRA_OPTS<br/>EXTRA_PACKAGE_OPTS| By default, this action runs `scancentral package -o package.zip` to package application source code. Use `PACKAGE_EXTRA_OPTS` to specify additional packaging options, for example `PACKAGE_EXTRA_OPTS: -bt mvn -bf <custom build file>`. See [Command-line options for the package command](https://www.microfocus.com/documentation/fortify-software-security-center/2520/sc-sast-ugd-html-25.2.0/index.htm#cli/package-cmd.htm) for more information on available options. Note that `EXTRA_PACKAGE_OPTS` is deprecated; please use `PACKAGE_EXTRA_OPTS`.|
| TOOL_DEFINITIONS | Fortify tool definitions are used by this GitHub Action to determine available versions, download location and other details of various Fortify-related tools, as required for action execution. By default, the Fortify-provided tool definitions hosted at https://github.com/fortify/tool-definitions/releases/tag/v1 will be used.<br/><br/>This environment variable allows for overriding the default tool definitions, pointing to either a URL or local (workspace) file. For example, if GitHub workflows are not allowed to download tools from their public internet locations, customers may host the tool installation bundles on an internal server, together with a customized tool definitions bundle that lists the alternative download URLs. |

<!-- END-INCLUDE:action/package/readme.md -->



<!-- START-INCLUDE:h2.support.md -->

## Support

For general assistance, please join the [Fortify Community](https://community.opentext.com/cybersec/fortify/) to get tips and tricks from other users and the OpenText team.
 
OpenText customers can contact our world-class [support team](https://www.opentext.com/support/opentext-enterprise/) for questions, enhancement requests and bug reports. You can also raise questions and issues through your OpenText Fortify representative like Customer Success Manager or Technical Account Manager if applicable.

You may also consider raising questions or issues through the [GitHub Issues page](https://github.com/fortify/github-action/issues) (if available for this repository), providing public visibility and allowing anyone (including all contributors) to review and comment on your question or issue. Note that this requires a GitHub account, and given public visibility, you should refrain from posting any confidential data through this channel. 

<!-- END-INCLUDE:h2.support.md -->


---

*[This document was auto-generated; do not edit by hand](https://github.com/fortify/shared-doc-resources/blob/main/USAGE.md)*
