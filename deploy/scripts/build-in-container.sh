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
cd ./frontend
npm install
npm run build > /dev/null
cp ./dist/* $cwd/public/ -R
rm -rf ./frontend
rm -rf ./deploy

###################################
# package admin panel to standalone
###################################
cd $cwd
rm -f eqemu-admin
pkg .
