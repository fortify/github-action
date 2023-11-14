# fortify/github-action/internal/run

This action can run arbitrary commands, as in the following example:

```yaml
    - uses: fortify/github-action/internal/run@v1
      with:
        cmd: '"${FCLI_CMD}" sc-sast session login ${_SC_SAST_LOGIN_OPTS}' 
```

The primary purpose of this action is to allow for proper handling of multiple options inside a single environment variable, like the `${_SC_SAST_LOGIN_OPTS}` variable above, supporting quotes to handle options containing spaces. The given `cmd` is run using the [`@actions/exec`](https://github.com/actions/toolkit/tree/main/packages/exec) module provided by GitHub, after interpolating any variable references.

Note that variable interpolation supports only simple variables in the format `${varName}`. Bash constructs like `${var:-default}` are not supported; if you wish to use such constructs, you'll first need to assign the output of such constructs to another environment variable, and then use that other environment variable instead. Nested variables are supported, for example `${_SC_SAST_LOGIN_OPTS}` in the above example may contain `${EXTRA_SC_SAST_LOGIN_OPTS}`; if this wasn't already expanded elsewhere, the action will expand this environment variable.

Similarly, other bash features are not supported either, like command chaining through `;`, `&&` or `||` or piping or redirection. The output of the command is simply sent to the GitHub Actions log. If deemed necessary, we could potentially add a feature to store the command output in an environment variable for further processing.