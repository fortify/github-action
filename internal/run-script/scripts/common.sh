#!/usr/bin/env bash
if [ -n "$RUNNER_DEBUG" ]; then
  set -v -x
fi

echo "Bash version: $BASH_VERSION"

declare -a runs
declare -a runsWithError
declare -A runResults
declare -A runCommands
function run {
  local operation=$1; shift;
  runs+=($operation)
  runCommands[$operation]="$@"
  echo RUN $operation: "$@"
  "$@"
  local exitCode=$?
  runResults[$operation]=$exitCode
  requireRun $operation || runsWithError+=($operation)
}

function requireRun {
  local operation=$1;
  [[ "${runResults[$operation]}" == "0" ]]
}

function printRunSummary {
  echo "Summary:"
  for value in "${runs[@]}"; do
    echo -n "  $value: "
    requireRun $value && echo "SUCCESS" || echo "ERROR"
  done
  if [ ! ${#runsWithError[@]} -eq 0 ]; then
    echo "Failing commands:"
    for value in "${runsWithError[@]}"; do
      echo "  $value: ${runCommands[$value]}"
    done
  fi
}

function failOnError {
  if [ ! ${#runsWithError[@]} -eq 0 ]; then
    exit 1;
  fi
}

declare -a failedRequirements
function require {
  local name=$1;
  local msg=$2;
  if [ -z "${!name}" ]; then
    [ ! -z "${msg}" ] || msg="ERROR: ${name} is required"
    failedRequirements+=("$msg")
  fi
}

function requireIf {
  local ifName=$1;
  local name=$2;
  local msg=$3;
  [ -z "${!ifName}" ] || [ "${!ifName}" == "false" ] || require "$name" "$msg"
}

function checkRequirements {
  if [ ! ${#failedRequirements[@]} -eq 0 ]; then
    for value in "${failedRequirements[@]}"; do
      echo "$value"
    done
    exit 1;
  fi
}

require "FCLI_CMD" "ERROR: fortify/github-action/setup must be run to set up fcli before running this action"
