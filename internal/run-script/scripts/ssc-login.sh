#!/usr/bin/env bash
. ${UTIL_DIR}/common.sh

requireVar "SSC_URL"
requireOneOfVar "SSC_TOKEN" "SSC_USER"
requireIfVar "SSC_USER" "SSC_PASSWORD"
checkRequirements

if [ -n "${SSC_TOKEN}" ]; then
  run "SSC_LOGIN" "${FCLI_CMD}" ssc session login --url "${SSC_URL}" -t "${SSC_TOKEN}" __expand:EXTRA_SSC_LOGIN_OPTS
else
  run "SSC_LOGIN" "${FCLI_CMD}" ssc session login --url "${SSC_URL}" -u "${SSC_USER}" -p "${SSC_PASSWORD}" __expand:EXTRA_SSC_LOGIN_OPTS  
fi

printRunSummary
failOnError
echo '_SSC_LOGGED_IN=true' >> $GITHUB_ENV 