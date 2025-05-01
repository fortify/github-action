#!/usr/bin/env bash
. ${UTIL_DIR}/common.sh

requireFcli
requireVar "SSC_URL"
requireOneOfVar "SSC_TOKEN" "SSC_USER"
requireIfVar "SSC_USER" "SSC_PASSWORD"
checkRequirements

if [[ -n "${SC_SAST_TOKEN}" ]]; then
  export _SC_SAST_TOKEN_OPTS="-c ${SC_SAST_TOKEN}"
fi

if [ -n "${SSC_TOKEN}" ]; then
  run "SSC_LOGIN" "${FCLI_CMD}" ssc session login --url "${SSC_URL}" -t "${SSC_TOKEN}" ${_SC_SAST_TOKEN_OPTS} __expand:EXTRA_SSC_LOGIN_OPTS __expand:SSC_LOGIN_EXTRA_OPTS
else
  run "SSC_LOGIN" "${FCLI_CMD}" ssc session login --url "${SSC_URL}" -u "${SSC_USER}" -p "${SSC_PASSWORD}" ${_SC_SAST_TOKEN_OPTS} __expand:EXTRA_SSC_LOGIN_OPTS __expand:SSC_LOGIN_EXTRA_OPTS
fi

printRunSummary
failOnError
echo '_SSC_LOGGED_IN=true' >> $GITHUB_ENV 