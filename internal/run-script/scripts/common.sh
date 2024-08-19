#!/usr/bin/env bash
if [ -n "$RUNNER_DEBUG" ]; then
  set -v -x
  echo "Bash version: $BASH_VERSION"
fi

#############################################################################
# Declare arrays used by the various functions below
declare -a failedRequirements     # Failed requirements
declare -a runs                   # Operations that have been run
declare -A runResults             # Exit code by operation
declare -A runCommands            # Expanded command line by operation

#############################################################################
# This function takes an operation name and output type (stdout/stderr) as
# arguments, and prints the corresponding file name where the run function
# will store the command output for the given operation.
function printOutputFileName {
  local operation=$1
  local type=$2
  mkdir -p "${TEMP_DIR}"
  printf '%s/output_%s_%s.txt' "${TEMP_DIR}" "${operation}" "${type}"
}

#############################################################################
# This function takes an operation name as previously run using the 'run'
# function and output type (stdout/stderr) as arguments, and prints the 
# corresponding command output.
function printOutput {
  local operation=$1
  local type=$2
  local fileName=$(printOutputFileName "${operation}" "${type}")
  [ -r "${fileName}" ] && cat "${fileName}"
}

#############################################################################
# This function takes an operation name as first argument, remaining
# arguments specify the command to run together with its arguments.
#
# Command arguments may contain environment variable references in the 
# format __expand:<VARNAME>, for example __expand:EXTRA_SC_SAST_SCAN_OPTS;
# these will be expanded before running the given command. The environment
# variable to be expanded may contain multiple arguments, including properly
# quoted arguments containing whitespace.
# 
# The following information is stored for each command being run through this
# function; this information can be retrieved or otherwise used through various
# other functions declared in this script.
# - The operation name is stored in the 'runs' array
# - The command with expanded arguments is stored by operation name in the 'runCommands' associative array
# - The command exit code is stored by operation name in the 'runResults' associative array
# - Command output (stdout & stderr) is stored in files; output file name can be retrieved
#   using the 'printOutputFileName' function, contents can be retrieved using the 'printOutput'
#   function
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

#############################################################################
# This function takes an operation name and exit code as arguments, allowing 
# to override the exit code of a previously run operation.
function overrideExitCode {
  local operation=$1
  local exitCode=$2
  runResults[$operation]=$exitCode
}

#############################################################################
# This function takes an operation name as input, and returns success if 
# that operation was run successfully, failure otherwise. It is commonly
# used to conditionally take some action based on the run result of some
# operation.
function ifRun {
  local operation=$1;
  [[ "${runResults[$operation]}" == "0" ]]
}

#############################################################################
# Given one or more operations, this function prints either SUCCESS, 
# FAILED, or SKIPPED.
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

#############################################################################
# This function prints the status of all operations previously run through 
# the 'run' function, showing either SUCCESS or ERROR for each operation,
# and a list of failing commands.
function printRunSummary {
  echo "Summary:"
  local failingOperations=()
  for value in "${runs[@]}"; do
    echo -n "  $value: "
    if ifRun $value; then
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

#############################################################################
# This function exits the script with exit code 1 if the run summary 
# contains any operation with ERROR status.
function failOnError {
  if [[ "$(printRunSummary)" == *"ERROR"* ]]; then
    exit 1;
  fi
}

#############################################################################
# This function takes an environment variable name and optional message as
# arguments, adding the given message or a default error message to the
# failedRequirements array if the given variable name is not declared.
function requireVar {
  local name=$1;
  local msg=$2;
  if [ -z "${!name}" ]; then
    [ ! -z "${msg}" ] || msg="ERROR: ${name} is required"
    failedRequirements+=("$msg")
  fi
}

#############################################################################
# This function takes two environment variable names and optional message
# as arguments. If the first environment variable name is declared and not
# set to false, the second variable name will be checked using the requireVar
# function. 
function requireIfVar {
  local ifName=$1;
  local name=$2;
  local msg=$3;
  [ -z "${!ifName}" ] || [ "${!ifName}" == "false" ] || requireVar "$name" "$msg"
}

#############################################################################
# This function takes two environment variable names as arguments, adding 
# an error message to the failedRequirementsArray if neither environment 
# variable is declared, or if both environment variables are declared.
function requireOneOfVar {
  local name1=$1;
  local name2=$2;
  local msg=$3;
  if [ -z "${!name1}" -a -z "${!name2}" ]; then
    failedRequirements+=("ERROR: Either ${name1} or ${name2} must be declared")
  elif [ -n "${!name1}" -a -n "${!name2}" ]; then
    failedRequirements+=("ERROR: Only one of ${name1} or ${name2} may be declared")
  fi
}

#############################################################################
# This function checks whether any previous calls to require* functions
# resulted in any failures; if so, failure messages are printed and the 
# script is exited with exit code 1.
function checkRequirements {
  if [ ! ${#failedRequirements[@]} -eq 0 ]; then
    for value in "${failedRequirements[@]}"; do
      echo "$value"
    done
    exit 1;
  fi
}

#############################################################################
# Require FCLI_CMD variable to be declared. Note that the parent script is
# responsible for calling the checkRequirements function to produce an error
# if FCLI_CMD is not declared.
requireVar "FCLI_CMD" "ERROR: fortify/github-action/setup must be run to set up fcli before running this action"
