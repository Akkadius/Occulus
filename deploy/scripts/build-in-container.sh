#!/usr/bin/env bash

cwd=$(pwd)

echo "cwd is $cwd"

###################################
# install backend npm modules
###################################
ls -lsh
rm -rf node_modules && npm install

###################################
# install and build frontend
###################################
cd /tmp
git clone https://github.com/Akkadius/eqemu-web-admin-client
cd eqemu-web-admin-client
npm install
npm run build
cp /tmp/eqemu-web-admin-client/dist/* $cwd/public/ -R

###################################
# package admin panel to standalone
###################################
cd $cwd
rm eqemu-admin || true
pkg -t node10-linux-x64 .
