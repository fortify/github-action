#!/usr/bin/env bash
. ${UTIL_DIR}/common.sh

requireFcli
requireVar "FOD_URL"
requireOneOfVar "FOD_CLIENT_ID" "FOD_USER"
requireIfVar "FOD_CLIENT_ID" "FOD_CLIENT_SECRET"
requireIfVar "FOD_USER" "FOD_PASSWORD"
requireIfVar "FOD_USER" "FOD_TENANT"
checkRequirements

if [ -n "${FOD_CLIENT_ID}" ]; then
  run "FOD_LOGIN" "${FCLI_CMD}" fod session login --url "${FOD_URL}" --client-id "${FOD_CLIENT_ID}" --client-secret "${FOD_CLIENT_SECRET}" __expand:EXTRA_FOD_LOGIN_OPTS
else
  run "FOD_LOGIN" "${FCLI_CMD}" fod session login --url "${FOD_URL}" -t "${FOD_TENANT}" -u "${FOD_USER}" -p "${FOD_PASSWORD}" __expand:EXTRA_FOD_LOGIN_OPTS
fi

printRunSummary
failOnError

echo '_FOD_LOGGED_IN=true' >> $GITHUB_ENV 