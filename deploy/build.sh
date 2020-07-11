#!/usr/bin/env bash

docker-compose up -d --force-recreate eqemu-admin-build
docker-compose exec eqemu-admin-build bash -c "~/scripts/build-in-container.sh"




