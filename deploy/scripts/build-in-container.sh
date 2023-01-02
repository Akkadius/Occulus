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

###################################
# package admin panel to standalone
###################################
cd $cwd
rm -f eqemu-admin
pkg .

###################################
# Fixme
# deal with name extensions when
# building multiple architectures
# to not break akk-stack
###################################
cp -a eqemu-admin-linux-x64 eqemu-admin-linux
cp -a eqemu-admin-win-x64.exe eqemu-admin-win.exe
