#!/usr/bin/env bash
. ${UTIL_DIR}/common.sh

requireScanCentralClient
checkRequirements

run "PACKAGE" "${SC_CLIENT_CMD}" package -o package.zip __expand:EXTRA_PACKAGE_OPTS __expand:PACKAGE_EXTRA_OPTS
printRunSummary
failOnError
