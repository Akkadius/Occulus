#!/usr/bin/env bash

docker build deploy/containers/eqemu-admin-build -t akkadius/eqemu:eqemu-admin-build-latest
docker push akkadius/eqemu:eqemu-admin-build-latest
