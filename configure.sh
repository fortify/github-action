#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
install_hooks=false
if [[ $# -eq 1 && "$1" == "--hooks" ]]; then
  install_hooks=true
elif [[ $# -ne 0 ]]; then
  printf 'Usage: %s [--hooks]\n' "$0" >&2
  exit 2
fi
npm ci --prefix .github/tooling --ignore-scripts --no-audit --no-fund
npm run generate --prefix .github/tooling
npm run typecheck --prefix .github/tooling
npm test --prefix .github/tooling
if [[ "$install_hooks" == true ]]; then
  node .github/tooling/git-hooks.mjs --install
fi
for hook in pre-commit post-checkout; do
  hook_path="$(git rev-parse --git-path "hooks/$hook")"
  if [[ -f "$hook_path" ]] && grep -Eq 'update-action-refs|npm run build.*git add dist' "$hook_path"; then
    printf 'Legacy generated hook found: %s. Remove its obsolete action build/reference commands.\n' "$hook_path"
  fi
done
