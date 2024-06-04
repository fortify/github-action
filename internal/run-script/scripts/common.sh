#!/bin/bash
if [ -n "$RUNNER_DEBUG" ]; then
  set -v -x
fi
if [ -z "$FCLI_CMD" ]; then
  echo "ERROR: fortify/github-action/setup must be run to set up fcli before running this action"
  exit 1;
fi

function run {
  echo RUN: "$@"
  "$@" 
}
