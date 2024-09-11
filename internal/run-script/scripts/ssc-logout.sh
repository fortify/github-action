#!/usr/bin/env bash
. ${UTIL_DIR}/common.sh

requireFcli
checkRequirements

if [[ "${_SSC_LOGGED_IN}" == "true" ]]; then
  echo '_SSC_LOGGED_IN=false' >> $GITHUB_ENV
  if [ -n "${SSC_TOKEN}" ]; then
    _SSC_LOGOUT_OPTS=("--no-revoke-token")
  elif [ -n "${SSC_USER}" -a -n "${SSC_PASSWORD}" ]; then
    _SSC_LOGOUT_OPTS=("-u" "${SSC_USER}" "-p" "${SSC_PASSWORD}")
  else
    _SSC_LOGOUT_OPTS=()
  fi
  run "SSC_LOGOUT" "${FCLI_CMD}" ssc session logout "${_SSC_LOGOUT_OPTS[@]}" 
  printRunSummary
  failOnError
fi