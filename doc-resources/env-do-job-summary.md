**`DO_JOB_SUMMARY`, `JOB_SUMMARY_ACTION`, `JOB_SUMMARY_EXTRA_OPTS`** - OPTIONAL    
If `DO_JOB_SUMMARY` is set to `true` (which implies `DO_WAIT`), this action will generate a job summary listing scan status and issue counts using the fcli-provided `release-summary` (FoD) or `appversion-summary` (SSC) action, or, if specified, the custom fcli action specified through `JOB_SUMMARY_ACTION`. `JOB_SUMMARY_ACTION` may point to a local file or URL; this custom fcli action must support (at least) the exact same action parameters (including any environment variable based default values for those parameters) as the built-in fcli action. Any extra options for the fcli action can be passed through the `JOB_SUMMARY_EXTRA_OPTS` environment variable, for example to specify the SSC filter sets to be included in the summary, or to allow an unsigned custom action to be used. Please see {{var:fcli-doc-base-url}}#_actions for more information. 