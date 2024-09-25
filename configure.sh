#! /bin/bash

echo "#!/bin/sh" > .git/hooks/pre-commit
echo './doc-resources/update-repo-docs.sh' >> .git/hooks/pre-commit 
for dir in setup; do
  (cd $dir && npm install)
  echo "(cd "$dir" && NODE_OPTIONS=--openssl-legacy-provider npm run build && git add dist/)" >> .git/hooks/pre-commit
done

echo "#!/bin/sh" > .git/hooks/post-checkout
echo './update-action-refs.sh "$(git rev-parse --abbrev-ref HEAD)"' >> .git/hooks/post-checkout

chmod +x .git/hooks/pre-commit .git/hooks/post-checkout
