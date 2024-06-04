#!/bin/bash
. ${UTIL_DIR}/common.sh

# This script assumes that fcli and Debricked CLI have already been installed,
# and that any necessary fcli sessions have been created.
# TODO Check prerequisites like SSC_APPVERSION, DEBRICKED_TOKEN, ...

if [ "${DO_SC_SAST_SCAN}" == "true" ]; then
  run ${FCLI_CMD} sc-sast scan start --publish-to "${SSC_APPVERSION}" -p package.zip -v "${SC_SAST_SENSOR_VERSION}" --store sc_sast_scan ${EXTRA_SC_SAST_SCAN_OPTS} \
    || exit 1
fi
if [ "${DO_DEBRICKED_SCAN}" == "true" ]; then
  # Debricked may return non-zero exit code on automation rule failures, in which case
  # we still want to run subsequent steps, hence we temporarily ignore the exit code,
  run ${DEBRICKED_CLI_CMD} scan -t "${DEBRICKED_TOKEN}" -i "Fortify GitHub Action" \
    || FAIL_ON_EXIT=true
  run ${FCLI_CMD} ssc artifact import-debricked --av "${SSC_APPVERSION}" --repository "${GITHUB_REPOSITORY}" --branch "${GITHUB_HEAD_REF:-$GITHUB_REF_NAME}" -t "${DEBRICKED_TOKEN}" --store debricked_scan \
    || exit 1
fi
if [ "${DO_WAIT}" == "true" ] || [ "${DO_EXPORT}" == "true" ]; then
  if [ "${DO_SC_SAST_SCAN}" == "true" ]; then
    run ${FCLI_CMD} sc-sast scan wait-for ::sc_sast_scan:: \
      || exit 1
  fi
  if [ "${DO_DEBRICKED_SCAN}" == "true" ]; then 
    run ${FCLI_CMD} ssc artifact wait-for ::debricked_scan:: \
      || exit 1
  fi
fi
if [ "${FAIL_ON_EXIT}" == "true" ]; then
  echo "Earlier failures detected"
  exit 1
fi
