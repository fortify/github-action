#!/bin/bash
. ${UTIL_DIR}/common.sh

if [ -z "$FOD_URL" ]; then
  echo "ERROR: FOD_URL environment variable must be set"; exit 1;
fi
if [ -n "${FOD_CLIENT_ID}" -a -n "${FOD_CLIENT_SECRET}" ]; then
  _FOD_AUTH_OPTS=("--client-id" "${FOD_CLIENT_ID}" "--client-secret" "${FOD_CLIENT_SECRET}")
elif [ -n "${FOD_USER}" -a -n "${FOD_PASSWORD}" -a -n "${FOD_TENANT}" ]; then
  _FOD_AUTH_OPTS=("-t" "${FOD_TENANT}" "-u" "${FOD_USER}" "-p" "${FOD_PASSWORD}")
else
  echo "ERROR: Either FOD_CLIENT_ID and FOD_CLIENT_SECRET, or FOD_TENANT, FOD_USER and FOD_PASSWORD environment variables must be set"
  exit 1;
fi
run ${FCLI_CMD} fod session login --url "${FOD_URL}" "${_FOD_AUTH_OPTS[@]}" ${EXTRA_FOD_LOGIN_OPTS} \
  || exit 1
echo '_FOD_LOGGED_IN=true' >> $GITHUB_ENV 