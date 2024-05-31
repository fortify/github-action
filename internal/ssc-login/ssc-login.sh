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

if [ -z "$SSC_URL" ]; then
  echo "ERROR: SSC_URL environment variable must be set"; exit 1;
fi
if [ -n "${SSC_TOKEN}" ]; then
  _SSC_AUTH_OPTS=("--token" "${SSC_TOKEN}")
elif [ -n "${SSC_USER}" -a -n "${SSC_PASSWORD}" ]; then
  _SSC_AUTH_OPTS=("-u" "${SSC_USER}" "-p" "${SSC_PASSWORD}")
else
  echo "ERROR: Either SSC_TOKEN, or SSC_USER and SSC_PASSWORD environment variables must be set"; exit 1;
fi
${FCLI_CMD} ssc session login --url "${SSC_URL}" "${_SSC_AUTH_OPTS[@]}" ${EXTRA_SSC_LOGIN_OPTS}
echo '_SSC_LOGGED_IN=true' >> $GITHUB_ENV 