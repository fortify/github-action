#! /bin/bash

cat << 'EOF' > .husky/pre-commit
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"
EOF
for dir in internal/run setup; do
  (cd $dir && npm install)
  echo "(cd "$dir" && NODE_OPTIONS=--openssl-legacy-provider npm run build && git add dist/)" >> .husky/pre-commit
done
git config --local core.hooksPath=.husky
