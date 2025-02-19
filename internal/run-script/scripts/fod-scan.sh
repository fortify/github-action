#!/usr/bin/env bash
. ${UTIL_DIR}/common.sh

# This script assumes that any necessary fcli sessions have been created.

requireFcli
requireFoDSession
requireVar "FOD_RELEASE"
checkRequirements

if doSetup; then
  run "SETUP" "${FCLI_CMD}" fod action run "${SETUP_ACTION:-setup-release}" \
    --rel "${FOD_RELEASE}" --scan-types sast __expand:SETUP_EXTRA_OPTS
fi

run "SAST_SCAN" "${FCLI_CMD}" fod sast-scan start \
    --rel "${FOD_RELEASE}" -f package.zip \
    --store fod_sast_scan __expand:EXTRA_FOD_SAST_SCAN_OPTS __expand:FOD_SAST_SCAN_EXTRA_OPTS
if doWait; then
  ifRun "SAST_SCAN" && run "SAST_PUBLISH" \
    "${FCLI_CMD}" fod sast-scan wait-for ::fod_sast_scan::
fi

if doPolicyCheck; then
  run "POLICY_CHECK" "${FCLI_CMD}" fod action run "${POLICY_CHECK_ACTION:-check-policy}" \
    --rel "${FOD_RELEASE}" __expand:POLICY_CHECK_EXTRA_OPTS
fi

# TODO Add policy check output to job summary
if doJobSummary; then
  # Collect scan/publish statuses for inclusion in job summary.
  SAST_SCAN_STATUS=$(printRunStatus "SAST_SCAN")
  SAST_PUBLISH_STATUS=$(printRunStatus "SAST_PUBLISH")

  cat <<EOF >> $GITHUB_STEP_SUMMARY
# Scan Summary
This section provides a status overview of the scans types supported by this GitHub Action, together with their status. 

| Analysis Type | Scan Status | Publish Status |
| ------------- | ----------- | -------------- |
| SAST          | ${SAST_SCAN_STATUS} | ${SAST_PUBLISH_STATUS} |

If any of the statuses shows \`FAILED\`, please review job logs to identify the cause of the failure. If any of the statuses
shows \`FAILED\` or \`SKIPPED\`, the corresponding details listed in the summary below may represent older scan results.
EOF

  run "JOB_SUMMARY" "${FCLI_CMD}" fod action run "${JOB_SUMMARY_ACTION:-release-summary}" \
    --rel "${FOD_RELEASE}" --progress=none __expand:JOB_SUMMARY_EXTRA_OPTS
  ifRun "JOB_SUMMARY" \
    && printOutput "JOB_SUMMARY" "stdout" >> $GITHUB_STEP_SUMMARY \
    || cat<<EOF >> $GITHUB_STEP_SUMMARY
# FoD Release Summary
There was an error generating the release summary; please review pipeline log for details.
EOF
fi

if doPRComment; then
  run "PR_COMMENT" "${FCLI_CMD}" fod action run "${PR_COMMENT_ACTION:-github-pr-comment}" \
    --rel "${FOD_RELEASE}" __expand:PR_COMMENT_EXTRA_OPTS
fi

printRunSummary
failOnError
