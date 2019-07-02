#!/usr/bin/env bash

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
cd /tmp
git clone https://github.com/Akkadius/eqemu-web-admin-client
cd eqemu-web-admin-client
npm install
npm run build > /dev/null
cp /tmp/eqemu-web-admin-client/dist/* $cwd/public/ -R

###################################
# package admin panel to standalone
###################################
cd $cwd
rm -f eqemu-admin
pkg .
