#!/usr/bin/env bash
. ${UTIL_DIR}/common.sh

# This script assumes that fcli and Debricked CLI have already been installed,
# and that any necessary fcli sessions have been created.

require "SSC_APPVERSION"
requireIf "DO_SC_SAST_SCAN" "SC_SAST_SENSOR_VERSION"
requireIf "DO_DEBRICKED_SCAN" "DEBRICKED_CLI_CMD"
requireIf "DO_DEBRICKED_SCAN" "DEBRICKED_TOKEN"
checkRequirements

if [ "${DO_SC_SAST_SCAN}" == "true" ]; then
  run "SAST_SCAN" ${FCLI_CMD} sc-sast scan start --publish-to "${SSC_APPVERSION}" -p package.zip -v "${SC_SAST_SENSOR_VERSION}" --store sc_sast_scan ${EXTRA_SC_SAST_SCAN_OPTS}
fi
if [ "${DO_DEBRICKED_SCAN}" == "true" ]; then
  # Debricked may return non-zero exit code on automation rule failures, in which case
  # we still want to run the import, so we don't explicitly check for Debricked scan success.
  run "DEBRICKED_SCAN" ${DEBRICKED_CLI_CMD} scan -t "${DEBRICKED_TOKEN}" -i "Fortify GitHub Action"
  run "DEBRICKED_IMPORT" ${FCLI_CMD} ssc artifact import-debricked --av "${SSC_APPVERSION}" --repository "${GITHUB_REPOSITORY}" --branch "${GITHUB_HEAD_REF:-$GITHUB_REF_NAME}" -t "${DEBRICKED_TOKEN}" --store debricked_scan
fi
if [ "${DO_WAIT}" == "true" ] || [ "${DO_EXPORT}" == "true" ]; then
  requireRun "SAST_SCAN" && run "SAST_PUBLISH" ${FCLI_CMD} sc-sast scan wait-for ::sc_sast_scan::
  requireRun "DEBRICKED_IMPORT" && run "DEBRICKED_PUBLISH" ${FCLI_CMD} ssc artifact wait-for ::debricked_scan::
fi

printRunSummary
failOnError
