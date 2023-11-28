#!/bin/bash
for f in $(find . -name 'action.yml'); do 
  if grep -qrlZ 'uses: fortify/github-action/' $f; then
    echo "Updating $f: version $1" && \
    sed -r -i -e "s|(uses: fortify\/github-action\/[^@]+)@.*|\1@$1|g" "$f"
  fi
done
