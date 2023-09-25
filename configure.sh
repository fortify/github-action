#! /bin/bash
(cd run && npm install)
(cd setup && npm install)
git config --local core.hooksPath=.husky