#!/usr/bin/env bash

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
npm run build
cp /tmp/eqemu-web-admin-client/dist/* ~/build/public/ -R

###################################
# package admin panel to standalone
###################################
cd ~/build/
rm eqemu-admin || true
pkg -t node10-linux-x64 .
