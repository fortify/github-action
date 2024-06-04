#!/bin/bash
. ${UTIL_DIR}/common.sh

if [[ "${_SSC_LOGGED_IN}" == "true" ]]; then
  echo '_SSC_LOGGED_IN=false' >> $GITHUB_ENV
  if [ -n "${SSC_TOKEN}" ]; then
    _SSC_LOGOUT_OPTS=("--no-revoke-token")
  elif [ -n "${SSC_USER}" -a -n "${SSC_PASSWORD}" ]; then
    _SSC_LOGOUT_OPTS=("-u" "${SSC_USER}" "-p" "${SSC_PASSWORD}")
  else
    echo "ERROR: Either SSC_TOKEN, or SSC_USER and SSC_PASSWORD environment variables must be set"; exit 1;
  fi
  run ${FCLI_CMD} ssc session logout "${_SSC_LOGOUT_OPTS[@]}" \
    || exit 1
fi