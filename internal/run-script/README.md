# fortify/github-action/internal/run-script

This action can run any of the scripts located in the `scripts` directory of this action, including the ability to run post-job scripts, for example to handle session logout.

```yaml
    - uses: fortify/github-action/internal/run-script@v1
      with:
        script: <script name>
        post:   <post-job script name>
```

Originally, the idea was to have these scripts located in each individual action directory, for example having `ssc-login.sh` and `ssc-logout.sh` scripts located in the `internal/ssc-login` directory. However, this proved to be difficult/impossible:

- As scripts need to be run using `bash` (also on Windows), we need to convert `${{github.action_path}}` (which may include drive letter and backslashes on Windows) to `bash` format; an example of how this can be done is shown in `action.yml`.
- GitHub lazily evaluates action inputs when running the post-job actions, but doesn't re-run any steps used to generate those inputs.

So, suppose we'd generate a `BASH_ACTION_PATH` environment variable that contains `${{github.action_path}}` in `bash` format, we'd expect to be able to use something like:

```yaml
    - uses: fortify/github-action/internal/run-script/js@feat-1.3.0
      with: 
        script: ${{ env.BASH_ACTION_PATH }}/ssc-login.sh
        post:   ${{ env.BASH_ACTION_PATH }}/ssc-logout.sh
```

This works fine for `script:`, but the `post:` script would use whatever the value of `BASH_ACTION_PATH` is during post-job execution. So, if we'd run both `ssc-login` and `sc-sast-login` actions, the post-job action would try to run `..../internal/sc-sast-login/ssc-logout.sh`, which would fail because of the incorrect directory name.

Several work-arounds were tried, but failed. Only way that this would likely work is to have the calling action pass something like a static action id, which would then be used by this action to set a `POST_<id>_SCRIPT=${{inputs.POST}}` environment variable. During post-job execution, we wouldn't look at any actual inputs, but instead just execute the script identified in the `POST_<id>_SCRIPT` environment variable.

Apart from hosting the scripts together with the action that executes them, another advantage of such an id is that we can also provide out-of-the-box support for run-once actions, like the various `login` actions; this is currently handled by setting an environment variable in the `*-login.sh` and `*-logout.sh` scripts. As we may also have scripts that may need to be run multiple times, we should control this through a `run-once: true|false` input.

Disadvantage, apart from slightly more complex implementation, is that each caller of this `run-script` action would also need to provide the value of `${{ github.action_path }}` as an input to this action, in order to have this action determine appropriate script location.


