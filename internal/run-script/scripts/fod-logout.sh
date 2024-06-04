#!/bin/bash
. ${UTIL_DIR}/common.sh

if [[ "${_FOD_LOGGED_IN}" == "true" ]]; then
  echo '_FOD_LOGGED_IN=false' >> $GITHUB_ENV
  run ${FCLI_CMD} fod session logout \
    || exit 1
fi