#!/usr/bin/env bash
. ${UTIL_DIR}/common.sh
checkRequirements

if [[ "${_FOD_LOGGED_IN}" == "true" ]]; then
  echo '_FOD_LOGGED_IN=false' >> $GITHUB_ENV
  run "FOD_LOGOUT" "${FCLI_CMD}" fod session logout
  printRunSummary
  failOnError
fi