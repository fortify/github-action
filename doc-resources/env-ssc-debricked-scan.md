{{include:env-ssc-connection.md}}

{{include:env-ssc-login.md}}

**`DEBRICKED_TOKEN`** - REQUIRED          
See the [Generate access token](https://docs.debricked.com/product/administration/generate-access-token) section in the Debricked documentation for details on how to generate this token.

{{include:env-ssc-appversion.md}}

**`DO_WAIT`** - OPTIONAL    
By default, this action will complete immediately after Debricked scan results have been uploaded to SSC. To have the workflow wait until the Debricked results have been processed by SSC (potentially failing if the results cannot be successfully processed), set the `DO_WAIT` environment variable to `true`.

For consistency with other actions, `DO_WAIT` is implied if `DO_EXPORT` is set to `true`, but since GitHub doesn't support importing Software Composition Analysis results, Debricked results will not be published to GitHub even if `DO_EXPORT` is set to `true`.
