# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
