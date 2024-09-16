#!/usr/bin/env bash
. ${UTIL_DIR}/common.sh

# This script assumes that fcli and Debricked CLI have already been installed,
# and that any necessary fcli sessions have been created.

requireFcli
requireVar "SSC_APPVERSION"
if [ "${DO_SC_SAST_SCAN}" == "true" ]; then
  requireSCSastSession
  requireVar "SC_SAST_SENSOR_VERSION"
fi
if [ "${DO_DEBRICKED_SCAN}" == "true" ]; then
  requireDebrickedCLI
  requireVar "DEBRICKED_TOKEN"
fi
checkRequirements

# Disable Debricked CLI colors 
export NO_COLOR=true

if [ "${DO_SC_SAST_SCAN}" == "true" ]; then
  run "SAST_SCAN" "${FCLI_CMD}" sc-sast scan start \
    --publish-to "${SSC_APPVERSION}" -p package.zip -v "${SC_SAST_SENSOR_VERSION}" \
    --store sc_sast_scan __expand:EXTRA_SC_SAST_SCAN_OPTS __expand:SC_SAST_SCAN_EXTRA_OPTS
fi
if [ "${DO_DEBRICKED_SCAN}" == "true" ]; then
  # Debricked may return non-zero exit code on automation rule failures, in which case
  # we still want to run the import, so we don't explicitly check for Debricked scan success.
  run "DEBRICKED_SCAN" "${DEBRICKED_CLI_CMD}" scan -t "${DEBRICKED_TOKEN}" -i "Fortify GitHub Action"
  run "DEBRICKED_SSC_IMPORT" "${FCLI_CMD}" ssc artifact import-debricked \
    --av "${SSC_APPVERSION}" --repository "${GITHUB_REPOSITORY}" \
    --branch "${GITHUB_HEAD_REF:-$GITHUB_REF_NAME}" -t "${DEBRICKED_TOKEN}" \
    --store debricked_scan
fi
if doWait; then
  ifRun "SAST_SCAN" && run "SAST_SSC_PUBLISH" \
    "${FCLI_CMD}" sc-sast scan wait-for ::sc_sast_scan::
  ifRun "DEBRICKED_SSC_IMPORT" && run "DEBRICKED_SSC_PUBLISH" \
    "${FCLI_CMD}" ssc artifact wait-for ::debricked_scan::
fi

# Collect Debricked scan output
DEBRICKED_SCAN_RESULTS=$(printOutput DEBRICKED_SCAN stdout | fgrep -e '───' -e '│' -e 'vulnerabilities found' -e 'For full details')

if doPolicyCheck; then
  run "POLICY_CHECK" "${FCLI_CMD}" ssc action run "${POLICY_CHECK_ACTION:-check-policy}" \
    --av "${SSC_APPVERSION}" --progress=none __expand:POLICY_CHECK_EXTRA_OPTS
fi

# TODO Add policy check output to job summary
if doJobSummary; then
  # Collect scan/publish statuses for inclusion in job summary.
  SAST_SCAN_STATUS=$(printRunStatus "SAST_SCAN")
  SAST_SSC_PUBLISH_STATUS=$(printRunStatus "SAST_SSC_PUBLISH")
  DEBRICKED_SCAN_STATUS=$(printRunStatus "DEBRICKED_SCAN")
  DEBRICKED_SSC_PUBLISH_STATUS=$(printRunStatus "DEBRICKED_SSC_IMPORT" "DEBRICKED_SSC_PUBLISH")
  [ "${DEBRICKED_SCAN_STATUS}" == "FAILED" ] && [ ! -z "${DEBRICKED_SCAN_RESULTS}" ] && DEBRICKED_SCAN_STATUS="FAILED_RULES"

  cat <<EOF >> $GITHUB_STEP_SUMMARY
# Scan Summary
This section provides a status overview of the scans types supported by this GitHub Action, together with their status. 

| Analysis Type | Scan Status | Publish Status |
| ------------- | ----------- | -------------- |
| DEBRICKED     | ${DEBRICKED_SCAN_STATUS} | ${DEBRICKED_SSC_PUBLISH_STATUS} |
| SCA           | ${SAST_SCAN_STATUS}      | ${SAST_SSC_PUBLISH_STATUS}      |

If any of the statuses shows \`FAILED\`, please review job logs to identify the cause of the failure. If any of the statuses
shows \`FAILED\` or \`SKIPPED\`, the corresponding details listed in the summary below may represent older scan results.
EOF

  [ ! -z "${DEBRICKED_SCAN_RESULTS}" ] && cat <<EOF >> $GITHUB_STEP_SUMMARY
# Debricked Scan Results

\`\`\`
${DEBRICKED_SCAN_RESULTS}
\`\`\`
EOF

  run "JOB_SUMMARY" "${FCLI_CMD}" ssc action run "${JOB_SUMMARY_ACTION:-appversion-summary}" \
    --av "${SSC_APPVERSION}" --progress=none __expand:JOB_SUMMARY_EXTRA_OPTS
  ifRun "JOB_SUMMARY" \
    && printOutput "JOB_SUMMARY" "stdout" >> $GITHUB_STEP_SUMMARY \
    || cat<<EOF >> $GITHUB_STEP_SUMMARY
# SSC Application Version Summary
There was an error generating the application version summary; please review pipeline log for details.
EOF
fi

if doPRComment; then
  run "PR_COMMENT" "${FCLI_CMD}" ssc action run "${PR_COMMENT_ACTION:-github-pr-comment}" \
    --av "${SSC_APPVERSION}" --progress=none __expand:PR_COMMENT_EXTRA_OPTS
fi

printRunSummary
failOnError
