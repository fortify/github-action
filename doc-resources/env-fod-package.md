**`EXTRA_PACKAGE_OPTS`** - OPTIONAL     
By default, this action runs `scancentral package -o package.zip` to package application source code. he `EXTRA_PACKAGE_OPTS` environment variable can be used to specify additional packaging options. 

If the FoD Debricked scanning feature has been purchased and configured on the applicable release, you'll need to pass the `-oss` option through this environment variable to collect additional files required for Open-Source scanning. 

Based on the  automated build tool detection feature provided by ScanCentral Client, this default `scancentral` command is often sufficient to properly package application source code. Depending on your build setup, you may however need to configure the `EXTRA_PACKAGE_OPTS` environment variable to specify additional packaging options. 

As an example, if the build file that you want to use for packaging doesn't adhere  to common naming conventions, you can configure the `-bf <custom build file>` option using the `EXTRA_PACKAGE_OPTS` environment variable. See [Command-line options for the package command]({{var:sc-client-doc-base-url#CLI.htm#Package}}) for more information on available options.