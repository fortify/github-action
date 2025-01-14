#!/usr/bin/env bash
. ${UTIL_DIR}/common.sh

requireScanCentralClient
checkRequirements

if [[ "${DO_PACKAGE_DEBUG}" == "true" ]]; then
  _SC_CLIENT_DEBUG_OPT=-debug
fi

run "PACKAGE" "${SC_CLIENT_CMD}" ${_SC_CLIENT_DEBUG_OPT} package -o package.zip __expand:EXTRA_PACKAGE_OPTS __expand:PACKAGE_EXTRA_OPTS
printRunSummary
failOnError
