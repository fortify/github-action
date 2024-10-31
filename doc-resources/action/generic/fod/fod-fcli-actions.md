### FoD Fcli Actions

<!-- Note that similar instructions are provided for SSC in ssc-fcli-actions.md; when updating these instructions, ssc-fcli-actions.md will likely need to be updated accordingly -->

{{include:action/generic/fcli-actions.md}}

When developing custom actions, please note that the GitHub Action expects certain action parameters to be supported by such a custom action. A common example is the `--rel` / `--release` command-line option, which the GitHub Action will automatically pass to most or all fcli actions to specify the FoD release to operate on. What command-line options are automatically passed to the fcli action may also depend on GitHub Action configuration. If the custom action doesn't support those action parameters, the action invocation will fail. You will also need to consider any options explicitly configured through the `*_EXTRA_OPTS` environment variable; for backward compatibility with existing GitHub Action workflows that have been configured with some extra action options, you should be careful with removing or renaming any action parameters.

Future versions of this documentation may provide more details on what command-line options are automatically passed to fcli actions. Until then, you'll need to review workflow logs and/or GitHub Action source code to identify what action parameters are being automatically passed by the GitHub Action. Alternatively, you may want to consider simply duplicating all action parameters from the fcli built-in action, even if some of those parameters will not be used by your custom action.
