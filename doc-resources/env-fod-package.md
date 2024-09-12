**`EXTRA_PACKAGE_OPTS` (deprecated), `PACKAGE_EXTRA_OPTS`** - OPTIONAL     
By default, this action runs `scancentral package -o package.zip` to package application source code. The `PACKAGE_EXTRA_OPTS` environment variable can be used to specify additional packaging options. 

If FoD Software Composition Analysis has been purchased and configured on the applicable release, you'll need to pass the `-oss` option through this environment variable to generate and package the additional dependency files required. 

Based on the  automated build tool detection feature provided by ScanCentral Client, this default `scancentral` command is often sufficient to properly package application source code. Depending on your build setup, you may however need to configure the `PACKAGE_EXTRA_OPTS` environment variable to specify additional packaging options. 

As an example, if the build file that you want to use for packaging doesn't adhere  to common naming conventions, you can configure the `-bf <custom build file>` option using the `PACKAGE_EXTRA_OPTS` environment variable. See [Command-line options for the package command]({{var:sc-client-doc-base-url}}#cli/package-cmd.htm) for more information on available options.
