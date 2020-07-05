#!/usr/bin/env bash

docker build deploy/containers/eqemu-admin-build -t akkadius/eqemu-admin-build-pipeline:latest
docker push akkadius/eqemu-admin-build-pipeline:latest
