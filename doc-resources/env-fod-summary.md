**`RELEASE_SUMMARY_ACTION`** - OPTIONAL   
If configured, the GitHub Action will run the specified fcli action to add a release summary to the GitHub Actions workflow summary. You can either set this variable to `release-summary` to use the default fcli-provided application version summary, or specify a custom fcli action file or URL. With the current version of this GitHub Action, any custom fcli action must accept at least the `--rel` option to specify the release for which to generate a summary. Setting this environment variable to a non-empty value implies `DO_WAIT`.

**`RELEASE_SUMMARY_ACTION_EXTRA_OPTS`** - OPTIONAL   
This environment variable allows for passing extra options to the `fcli fod action run <RELEASE_SUMMARY_ACTION>` command. Please see the `fcli fod action help <RELEASE_SUMMARY_ACTION>` command for supported options. For example, this can be used to allow an unsigned custom action to be used.
