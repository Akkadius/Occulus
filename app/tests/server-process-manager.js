const assert               = require('assert');
const serverProcessManager = require('../../app/core/server-process-manager');
const helper               = require('./helpers/helper-functions');
const _log                 = require('./helpers/helper-functions').log;
const path                 = require('path');
const pathManager          = require('../../app/core/path-manager')

/**
 * Init path manager
 */
pathManager.initAppPaths(path.join(__dirname, '../../'));

const PROCESS_BOOT_TIME = 1000;

describe('Server Process Manager', function () {
  before(function () {
    _log("Setting up...");
    serverProcessManager.stopServer();
    _log("Stopped processes...");
  });

  it('Stop server should stop all processes', async function () {
    serverProcessManager.stopServer();

    const process_counts = await serverProcessManager.getProcessCounts();

    assert.equal(process_counts.world, 0);
    assert.equal(process_counts.zone, 0);
    assert.equal(process_counts.queryserv, 0);
    assert.equal(process_counts.ucs, 0);
    assert.equal(process_counts.loginserver, 0);
  });

  it('Server launcher should start basic server processes', async function () {
    await serverProcessManager.startServerLauncher();
    await helper.sleep(PROCESS_BOOT_TIME);
    const process_counts = await serverProcessManager.getProcessCounts();

    assert.ok(process_counts.world > 0);
    assert.ok(process_counts.zone > 0);
    assert.ok(process_counts.queryserv > 0);
    assert.ok(process_counts.ucs > 0);
  });

  it('Should return booted zone count', async function () {
    this.timeout(10000);

    await serverProcessManager.stopServer();
    await serverProcessManager.startServerLauncher();
    await helper.sleep(PROCESS_BOOT_TIME);
    await serverProcessManager.startStaticZone("soldungb");
    await helper.sleep(PROCESS_BOOT_TIME);
    const booted_zone_count = await serverProcessManager.getBootedZoneCount();

    assert.ok(booted_zone_count > 0);

  });

  after(function () {
    _log("Tearing down...");
    serverProcessManager.stopServer();
    _log("Stopped processes...");
  });
});