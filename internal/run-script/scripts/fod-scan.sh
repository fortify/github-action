#!/usr/bin/env bash
. ${UTIL_DIR}/common.sh

# This script assumes that fcli has already been installed,
# and that any necessary fcli sessions have been created.

requireVar "FOD_RELEASE"
checkRequirements

run "SAST_SCAN" "${FCLI_CMD}" fod sast-scan start \
    --rel "${FOD_RELEASE}" -f package.zip \
    --store fod_sast_scan __expand:EXTRA_FOD_SAST_SCAN_OPTS
if [ "${DO_WAIT}" == "true" ] || [ "${DO_EXPORT}" == "true" ]; then
  ifRun "SAST_SCAN" && run "SAST_PUBLISH" \
    "${FCLI_CMD}" fod sast-scan wait-for ::fod_sast_scan::
fi

# Collect scan/publish statuses for inclusion in job summary.
SAST_SCAN_STATUS=$(printRunStatus "SAST_SCAN")
SAST_PUBLISH_STATUS=$(printRunStatus "SAST_PUBLISH")

cat <<EOF >> $GITHUB_STEP_SUMMARY
# Scan Summary
This section provides a status overview of the scans types supported by this GitHub Action, together with their status. If any of the statuses shows \`FAILED\`, please review job logs. 

| Analysis Type | Scan Status | Publish Status |
| ------------- | ----------- | -------------- |
| SAST          | ${SAST_SCAN_STATUS} | ${SAST_PUBLISH_STATUS} |
EOF

RELEASE_SUMMARY_ACTION="${RELEASE_SUMMARY_ACTION:-release-summary}"
if [ -n "${RELEASE_SUMMARY_ACTION}" ]; then
  run "RELEASE_SUMMARY" "${FCLI_CMD}" fod action run "${RELEASE_SUMMARY_ACTION}" \
    --rel "${FOD_RELEASE}" --progress=none __expand:RELEASE_SUMMARY_ACTION_EXTRA_OPTS
  ifRun "RELEASE_SUMMARY" \
    && printOutput "RELEASE_SUMMARY" "stdout" >> $GITHUB_STEP_SUMMARY \
    || cat<<EOF >> $GITHUB_STEP_SUMMARY
# FoD Release Summary
There was an error generating the release summary; please review pipeline log for details.
EOF
fi

printRunSummary
failOnError
