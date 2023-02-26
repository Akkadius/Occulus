#!/usr/bin/env bash

docker build deploy/containers/eqemu-admin-build -t mibastian/eqemu-admin-build-pipeline:latest
docker push mibastian/eqemu-admin-build-pipeline:latest
