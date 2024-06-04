#!/usr/bin/env bash
. ${UTIL_DIR}/common.sh

if [ -z "$SSC_URL" ]; then
  echo "ERROR: SSC_URL environment variable must be set"; exit 1;
fi
if [ -z "$SC_SAST_TOKEN" ]; then
  echo "ERROR: SC_SAST_TOKEN environment variable must be set"; exit 1;
fi
if [ -z "SSC_TOKEN" ]; then
  echo "ERROR: SSC_TOKEN environment variable must be set"; exit 1;
fi
run "SC_SAST_LOGIN" ${FCLI_CMD} sc-sast session login --ssc-url "${SSC_URL}" -t "${SSC_TOKEN}" -c "${SC_SAST_TOKEN}" ${EXTRA_SC_SAST_LOGIN_OPTS}
printRunSummary
failOnError
echo '_SC_SAST_LOGGED_IN=true' >> $GITHUB_ENV 