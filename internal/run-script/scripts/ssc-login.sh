#!/usr/bin/env bash
. ${UTIL_DIR}/common.sh

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
run "SSC_LOGIN" ${FCLI_CMD} ssc session login --url "${SSC_URL}" "${_SSC_AUTH_OPTS[@]}" ${EXTRA_SSC_LOGIN_OPTS}
printRunSummary
failOnError
echo '_SSC_LOGGED_IN=true' >> $GITHUB_ENV 