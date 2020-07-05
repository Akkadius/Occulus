# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.10]
* Debugging Windows issues

## [2.0.9]
* Update meta endpoint to include players online

## [2.0.8]
* Add endpoints
  * GET /v1/api/admin/logs/list
  * GET /v1/api/admin/logs/view/:file
  * GET /v1/api/server/meta
  * GET /v1/api/server/schema

## [2.0.7]
* Add build cancel endpoint

## [2.0.6]
* Fix build endpoint to be async

## [2.0.5]
* Add new endpoints
  * POST /v1/api/git/update/quests
  * POST /v1/api/git/update/maps
  * POST /v1/api/code/git/update
  * POST /v1/api/code/build
  * GET /v1/api/code/build/status
  * POST /v1/api/code/git/branch/:branch
  * GET /v1/api/code/git/branches

## [2.0.4]
* Fix for database editing

## [2.0.3]
* Fix for asset downloading

## [2.0.2]
* Remove models from code; use repositories and raw queries underneath
* Updated Sequelize to 5.21.11
* Added content database connection to back-end database module
* Added content database connection to front-end
* Updated dashboard stats to point to content database
* Updated hot-reload listener to point to content database

## [2.0.1]
* UI fixes

## [2.0.0]
* Rename project as Occulus

## [1.1.3]
* Move FE into BE project

## [1.1.0] 
* UI overhaul / cleanup
* Fix client asset downloading on the backend

## [1.0.9] - 2020-3-15
* Fixing issue where when watchdog triggers and launcher is restarted while server is still online that we do not run shared memory again which has a chance to introduce overflow issues with data that is contained in shared memory

## [1.0.8] - 2020-2-1
* Add CLI service [hot-reload-listener]

## [1.0.7] - 2020-1-13
* Add launcher default config options

## [1.0.6] - 2020-1-7
* Implement timed restarts
* Implement timed restart cancelling

## [1.0.5] - 2020-1-6
* Launcher refactoring, shared memory on bootup support
* Update server processes on dashbaord in realtime
* Add options to server bootup, refactor modals
* Add keymaps
  * p - Start Server modal
  * r - Restart Server modal
  * s - Stop Server modal

## [1.0.4] - 2020-1-4
* Fix edge case in launcher stability where in the event that the launcher loses connection with world or the main launcher loop hangs, zones stop booting. This situation was rarer but a watchdog has been implemented to kill the launcher process in the event that this occurs. Requires the launcher process to be ran in a loop

## [1.0.3] - 2019-11-3
* Launcher stability

## [1.0.2] - 2019-11-3
* Fix Launcher double process boot issues with underlying process list package

## [1.0.1] - 2019-10-14
* Init admin password on first boot

## [1.0.0] - 2019-07-02
### Added
* Initial release
