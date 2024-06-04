#!/bin/bash
. ${UTIL_DIR}/common.sh

if [[ "${_SC_SAST_LOGGED_IN}" == "true" ]]; then
  echo '_SC_SAST_LOGGED_IN=false' >> $GITHUB_ENV
  run ${FCLI_CMD} sc-sast session logout --no-revoke-token \
    || exit 1
fi