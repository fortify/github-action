#!/usr/bin/env bash
. ${UTIL_DIR}/common.sh

requireVar "SSC_URL"
requireVar "SC_SAST_TOKEN"
requireVar "SSC_TOKEN"
checkRequirements

run "SC_SAST_LOGIN" "${FCLI_CMD}" sc-sast session login --ssc-url "${SSC_URL}" -t "${SSC_TOKEN}" -c "${SC_SAST_TOKEN}" __expand:EXTRA_SC_SAST_LOGIN_OPTS
printRunSummary
failOnError
echo '_SC_SAST_LOGGED_IN=true' >> $GITHUB_ENV 