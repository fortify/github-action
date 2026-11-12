#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
if [[ $# -ne 0 ]]; then
  printf 'Usage: %s\n' "$0" >&2
  exit 2
fi
if [[ -d ".github/tooling/node_modules" ]]; then
  printf 'Remove the obsolete .github/tooling/node_modules installation before continuing; it can shadow the root dependencies.\n' >&2
  exit 1
fi
if hooks_path="$(git config --get core.hooksPath)"; then
  :
else
  status=$?
  if [[ "$status" -ne 1 ]]; then
    exit "$status"
  fi
fi
if [[ "$hooks_path" == ".github/tooling/hooks" ]]; then
  printf 'The repository validation hooks were removed. Disable the obsolete setting with: git config --local --unset core.hooksPath\n' >&2
fi
npm ci --ignore-scripts --no-audit --no-fund
npm run build
npm run check
npm run typecheck
npm test
