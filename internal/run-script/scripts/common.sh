#!/usr/bin/env bash
if [ -n "$RUNNER_DEBUG" ]; then
  set -v -x
  echo "Bash version: $BASH_VERSION"
fi

function printOutputFileName {
  local operation=$1
  local type=$2
  mkdir -p "${TEMP_DIR}"
  printf '%s/output_%s_%s.txt' "${TEMP_DIR}" "${operation}" "${type}"
}

function printOutput {
  local operation=$1
  local type=$2
  local fileName=$(printOutputFileName "${operation}" "${type}")
  [ -r "${fileName}" ] && cat "${fileName}"
}

declare -a runs
declare -A runResults
declare -A runCommands
function run {
  local operation=$1; shift;
  local cmd=( )
  for arg in "$@"; do
    # Expand environment variables that potentially contain multiple arguments.
    # This is commonly used for *_EXTRA_OPTS environment variables, needed to
    # properly handle quoted arguments containing whitespace.
    if [[ "$arg" == "__expand:"* ]]; then
      local varName=${arg#"__expand:"}
      if [ ! -z "${!varName}" ]; then
        readarray -d '' expandedArgs < <(xargs printf '%s\0' <<<"${!varName}")
        cmd+=("${expandedArgs[@]}")
      fi
    else
      cmd+=("$arg")
    fi
  done
  runs+=($operation)
  runCommands[$operation]="${cmd[@]}"
  echo "::group::RUN $operation: ${cmd[@]}"
  # Any better way of doing this, avoiding writing exit code to temporary file?
  local exitCodeFile="$TEMP_DIR/exit_code.txt"
  { ("${cmd[@]}"; echo >"$exitCodeFile" $?) 2>&1 1>&3 3>&- \
    | tee $(printOutputFileName "${operation}" "stderr"); } 3>&1 1>&2 \
    | tee $(printOutputFileName "${operation}" "stdout")
  local exitCode=$(cat "$exitCodeFile")
  rm -f ${exitCodeFile}
  runResults[$operation]=$exitCode
  echo "::endgroup::"
}

function overrideExitCode {
  local operation=$1
  local exitCode=$2
  runResults[$operation]=$exitCode
}

function requireRun {
  local operation=$1;
  [[ "${runResults[$operation]}" == "0" ]]
}

function printRunStatus {
  local operations=("$@");
  local fail=0, success=0;
  for op in "${operations[@]}"; do
    if [ -z "${runResults[$op]}" ]; then
      skip=1
    elif [[ "${runResults[$op]}" == "0" ]]; then
      success=1
    else
      fail=1
    fi
  done
  if [[ ${fail} == 1 ]]; then
    echo "FAILED"
  elif [[ ${success} == 1 ]]; then
    echo "SUCCESS"
  else
    echo "SKIPPED"
  fi
}

function printRunSummary {
  echo "Summary:"
  local failingOperations=()
  for value in "${runs[@]}"; do
    echo -n "  $value: "
    if requireRun $value; then
      echo "SUCCESS" 
    else 
      echo "ERROR"
      failingOperations+=("${value}")
    fi
  done
  if [ ! ${#failingOperations[@]} -eq 0 ]; then
    echo "Failing commands:"
    for value in "${failingOperations[@]}"; do
      echo "  $value: ${runCommands[$value]}"
    done
  fi
}

function failOnError {
  if [[ "$(printRunSummary)" == *"ERROR"* ]]; then
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
