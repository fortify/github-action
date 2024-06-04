**`DO_WAIT`** - OPTIONAL    
By default, this action will not wait until the scan has been completed. To have the workflow wait until the scan has been completed, set the `DO_WAIT` environment variable to `true`. Note that `DO_WAIT` is implied if `DO_EXPORT` is set to `true`; see below.

**`DO_EXPORT`** - OPTIONAL    
If set to `true`, this action will export scan results to the GitHub Security Code Scanning dashboard. Note that this may require a [GitHub Advanced Security](https://docs.github.com/en/get-started/learning-about-github/about-github-advanced-security) subscription, unless you're running this action on a public github.com repository. Note that GitHub only supports importing SAST results; other results will not exported to GitHub.
