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
# amd64 admin panel packaging
###################################
# This will fail if you do not have
# binfmt support installed on the
# host. You can safely ignore this.
# To enable binfmt support on
# Debian/Ubuntu install
# qemu-user-static, binfmt-support
pkg -t node12-linux-arm64 -o eqemu-admin-linux-arm64 . 2>/dev/zero \
        || echo "amd64 packaging failed due to missing binfmt support."
