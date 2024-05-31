#!/bin/bash

### Start common code
if [ -n "$RUNNER_DEBUG" ]; then
  set -v -x
fi
if [ -z "$FCLI_CMD" ]; then
  echo "ERROR: fortify/github-action/setup must be run to set up fcli before running this action"
  exit 1;
fi
### End common code

if [[ "${_SC_SAST_LOGGED_IN}" == "true" ]]; then
  echo '_SC_SAST_LOGGED_IN=false' >> $GITHUB_ENV
  ${FCLI_CMD} sc-sast session logout --no-revoke-token || exit 1
fi