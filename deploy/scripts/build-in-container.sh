#!/usr/bin/env bash

set -x #echo on

###################################
# cwd
###################################
cwd=$(pwd)
echo "cwd is $cwd"

###################################
# install backend npm modules
###################################
rm -rf node_modules && npm install

###################################
# install and build frontend
###################################
cd $cwd/frontend && npm install && npm run build
cp $cwd/frontend/dist/* $cwd/public/ -R
cat $cwd/frontend/dist/index.html
cat $cwd/public/index.html
ls -lsh $cwd
ls -lsh $cwd/frontend/dist/

###################################
# package admin panel to standalone
###################################
cd $cwd
rm -f eqemu-admin
pkg .
