#!/usr/bin/env bash
. ${UTIL_DIR}/common.sh

requireFcli
requireVar "PRODUCT"
checkRequirements

run "EXPORT" "${FCLI_CMD}" "${PRODUCT}" action run "${EXPORT_ACTION:-github-sast-report}" __expand:DEFAULT_OPTS __expand:EXTRA_EXPORT_OPTS
printRunSummary
failOnError
