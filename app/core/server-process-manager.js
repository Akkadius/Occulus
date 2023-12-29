/**
 * server-process-manager.js
 */
const { exec, execSync } = require('child_process');
const serverDataService  = require('./eqemu-data-service-client.js');
const pathManager        = require('./path-manager');
const fs                 = require('fs');
const path               = require('path');
const util               = require('util');
const psList             = require('ps-list');
const debug              = require('debug')('eqemu-admin:process-manager');
const config             = require('./eqemu-config-service');
const systemProc         = require('process');
const { static }         = require("express");
const os                 = use('/app/core/operating-system');

/**
 * Constants
 * @type {number}
 */
const MAX_PROCESS_POLL_DELTA_SECONDS_BEFORE_KILL = 60;
const WATCHDOG_TIMER                             = 1000;
const LAUNCHER_MAIN_LOOP_TIMER                   = 5 * 1000;

/**
 * @type {{check: module.exports.check}}
 */
module.exports = {
  erroredStartsCount: {},
  hasErroredHaltMessage: {},
  erroredStartsMaxHalt: 5,
  processCount: {},
  serverProcessNames: ['zone', 'world', 'ucs', 'queryserv', 'loginserver'],
  onlineStatics: [],
  systemProcessList: {},
  launchOptions: {},
  watchDogTimer: null,
  cancelTimedRestart: false,
  cancelTimedShutdown: false,
  lastProcessPollTime: Math.floor(new Date() / 1000),

  /**
   * Launcher initialization
   * @param options
   * @param skipConfigWatch
   */
  init: function (options, skipConfigWatch = false) {
    if (typeof options !== "undefined") {
      this.launchOptions = options;
    }

    if (typeof this.launchOptions === "undefined") {
      this.launchOptions = {}
    }

    if (process.platform === "win32") {
      process.title = "EQEmu Server Launcher"
    }

    config.init(skipConfigWatch);

    this.serverProcessNames.forEach((processName) => {
      this.erroredStartsCount[processName]    = 0;
      this.hasErroredHaltMessage[processName] = 0;
      this.processCount[processName]          = 0;
    });
  },

  getStatics() {
    const statics = config.getAdminPanelConfig('launcher.staticZones', "load2,cshome")
    if (statics.length > 0) {
      return statics.split(",")
    }

    return []
  },

  /**
   * @returns {number}
   */
  getWatchDogPollDelta() {
    return (Math.floor(new Date() / 1000) - this.lastProcessPollTime);
  },

  /**
   * @returns {boolean}
   */
  isEqemuServerOnline() {
    let isServerOnline = false;
    this.serverProcessNames.forEach((processName) => {
      if (this.processCount[processName] > 0) {
        isServerOnline = true;
      }
    });

    debug('isEqemuServerOnline [%s]', isServerOnline);

    return isServerOnline;
  },

  /**
   * @param options
   * @returns {Promise<void>}
   */
  start: async function (options = []) {
    this.init(options, true);

    await this.pollProcessList();

    if (await this.isLauncherBooted()) {
      debug('Launcher is already booted... exiting...');
      console.log('Launcher is already booted... exiting...');
      process.exit();
    }

    debug('server is [%s]', (this.isEqemuServerOnline() ? 'online' : 'offline'));

    /**
     * Shared memory
     */
    if (config.getAdminPanelConfig('launcher.runSharedMemory') && !this.isEqemuServerOnline()) {
      debug('Running shared memory');

      if (os.isLinux()) {
        execSync('./bin/shared_memory', { cwd: pathManager.emuServerPath }).toString();
      }

      if (os.isWindows()) {
        execSync('bin\\shared_memory', { cwd: pathManager.emuServerPath }).toString();
      }
    }

    if (config.getAdminPanelConfig('launcher.runLoginserver', false)) {
      debug('Running loginserver');
      this.launchOptions.withLoginserver = true;
    }

    if (config.getAdminPanelConfig('launcher.runQueryServ', false)) {
      debug('Running queryserv');
      this.launchOptions.withQueryserv = true;
    }

    this.startWatchDog();

    config.setAdminPanelConfig('launcher.isRunning', true);

    /**
     * Main launcher loop
     */
    while (1) {
      await this.pollProcessList();
      await this.getBootedZoneCount();

      /**
       * @type {exports}
       */
      for (const processName of ['loginserver', 'ucs', 'world', 'queryserv']) {
        if (this.doesProcessNeedToBoot(processName) && !await this.isProcessRunning(processName)) {
          debug('starting unique process [' + processName + ']');
          this.startProcess(processName);
        }
      }

      // statics
      for (let s of this.getStatics()) {
        if (!this.onlineStatics.includes(s)) {
          this.startProcess("zone", [s])
        }
      }

      /**
       * Zone
       */
      while (this.doesProcessNeedToBoot('zone')) {
        await this.startProcess('zone');
      }

      await this.sleep(LAUNCHER_MAIN_LOOP_TIMER);

      this.lastProcessPollTime = Math.floor(new Date() / 1000);
    }
  },

  /**
   * @param processName
   * @returns {boolean}
   */
  doesProcessNeedToBoot: function (processName) {

    if (this.erroredStartsCount[processName] >= this.erroredStartsMaxHalt) {
      if (!this.hasErroredHaltMessage[processName]) {
        console.error('Process [%s] has tried to boot too many (%s) times... Halting attempts', processName, this.erroredStartsMaxHalt);
        this.hasErroredHaltMessage[processName] = 1;
      }

      return false;
    }

    if (processName === 'zone' &&
      this.processCount[processName] < (this.zoneBootedProcessCount + config.getAdminPanelConfig('launcher.minZoneProcesses', 10))) {

      return true;
    }

    if (processName === 'loginserver') {
      return config.getAdminPanelConfig('launcher.runLoginserver', false) && this.processCount[processName] === 0;
    }

    if (processName === 'queryserv') {
      return config.getAdminPanelConfig('launcher.runQueryServ', false) && this.processCount[processName] === 0;
    }

    debug('[doesProcessNeedToBoot] [%s] returning [%s]', processName, this.processCount[processName] === 0);

    return this.processCount[processName] === 0;
  },

  /**
   * @param zoneShortName
   * @returns {Promise<void>}
   */
  startStaticZone: async function (zoneShortName) {
    return await this.startProcess('zone', [zoneShortName]);
  },

  /**
   * @returns {Promise<void>}
   */
  stopServer: async function (options = []) {
    this.init([], true);

    // reset timed restart if triggered restart again
    this.cancelTimedShutdown = false;

    // delayed restart
    if (options.timer && options.timer > 0) {
      const startTime     = Math.floor(new Date() / 1000);
      const endTime       = startTime + parseInt(options.timer);
      let shutdownTime    = false;
      let lastWarningTime = Math.floor(new Date() / 1000) - 1000;

      while (!shutdownTime) {
        const minutesRemaining = (endTime - Math.floor(new Date() / 1000)) / 60;
        const unixTimeNow      = Math.floor(new Date() / 1000);

        if ((lastWarningTime + 30) <= unixTimeNow) {
          lastWarningTime = unixTimeNow;

          const worldMessage = util.format(
            '[SERVER MESSAGE] The world will be coming down in [%s] minute(s), please log out before this time...',
            Number((minutesRemaining).toFixed(2))
          );

          await serverDataService.messageWorld(worldMessage);

          debug('Sending world message | %s', worldMessage);
        }

        if (unixTimeNow > endTime) {
          shutdownTime = true;
        }

        if (this.cancelTimedShutdown) {
          break;
        }

        await this.sleep(1000);
      }
    }

    if (this.cancelTimedShutdown) {
      debug('Shutdown cancelled');
      return false;
    }

    await this.pollProcessList();

    debug('[stopServer] Stopping server...');

    /**
     * Kill launcher
     */
    this.systemProcessList.forEach((process) => {
      if (process.cmd.includes('server-launcher')) {
        this.killProcess(process.pid);

        debug('[stopServer] Killing launcher [%s] pid [%s]', process.name, process.pid);
      }
    });

    /**
     * Kill server processes
     */
    this.systemProcessList.forEach((process) => {
      if (this.serverProcessNames.includes(process.name)) {
        this.killProcess(process.pid);

        debug('[stopServer] Killing server process [%s] pid [%s]', process.name, process.pid);
      }
    });

    config.setAdminPanelConfig('launcher.isRunning', false);

    return this;
  },

  /**
   * @returns {Promise<boolean>}
   */
  async isLauncherBooted() {
    let isLauncherBooted = false;
    await this.pollProcessList();
    this.systemProcessList.forEach(function (proc) {

      if (os.isLinux()) {

        /**
         * 1) Make sure we're looking for a command running the launcher
         * 2) Make sure it isn't this process
         * 3) Make sure it's not a while loop that is keeping it alive
         */
        if (
          proc.cmd.includes('server-launcher') &&
          parseInt(proc.pid) !== parseInt(systemProc.pid) &&
          !proc.cmd.includes('while')
        ) {
          isLauncherBooted = true;
        }
      }

      if (os.isWindows()) {
        if (
          proc.cmd.includes('server-launcher') &&
          parseInt(proc.pid) !== parseInt(systemProc.pid)
        ) {

          debug("Launcher is already booted");
          debug(proc);
          debug("Current system proc [%s]", systemProc.pid);
          debug("process.pid [%s]", proc.pid);

          isLauncherBooted = true;
        }
      }
    });

    debug('isLauncherBooted [%s]', isLauncherBooted);

    return isLauncherBooted;
  },

  checkIfLauncherNeedsToBeRevived: async function () {
    const isLauncherRunning = config.getAdminPanelConfig('launcher.isRunning');
    if (isLauncherRunning) {
      this.startServerLauncher();
    }
  },

  /**
   * @returns {exports}
   */
  startServerLauncher: async function (options) {

    /**
     * Parse args
     *
     * @type {*[]}
     */
    let args = [];
    if (options) {
      args.push(options);
    }

    let argString = '';
    args.forEach(function (arg) {
      argString += arg + ' ';
    });

    /**
     * Bail out if launcher already started
     */
    if (await this.isLauncherBooted()) {
      debug('Launcher is already booted... exiting...');
      return false;
    }

    let startProcessString = '';

    /**
     * PKG_EXECPATH needs to be blank due to https://github.com/vercel/pkg/issues/376
     */
    if (os.isLinux()) {
      startProcessString = util.format(
        // 'while true; do nohup PKG_EXECPATH=; %s server-launcher %s 1>/dev/null 2>/dev/null && sleep 1 ; done &',
        'export PKG_EXECPATH=; export DEBUG=eqemu-admin:*; %s server-launcher %s &',
        pathManager.getEqemuAdminEntrypoint(),
        argString
      );

      config.setAdminPanelConfig('launcher.isRunning', true);
      console.log("[Process Manager] Starting server launcher...");

      require('child_process').spawn(startProcessString,
        {
          cwd: pathManager.emuServerPath,
          encoding: 'utf8',
          shell: '/bin/bash',
          detached: true
        }
      ).on('error', function (err) {
        console.log(err);
      });
    }

    if (os.isWindows()) {
      if (pathManager.isRanFromPackagedNode()) {
        startProcessString = util.format(
          'set PKG_EXECPATH= && start /b %s server-launcher %s',
          pathManager.getEqemuAdminEntrypoint(),
          argString
        );
      } else if (pathManager.isRanAsStandaloneNodeProject()) {
        startProcessString = util.format(
          'set PKG_EXECPATH= && start /b node %s server-launcher %s',
          pathManager.getEqemuAdminEntrypoint(),
          argString
        );
      }

      // console.log("starting launcher [%s]", startProcessString)

      let startArgs = ["/c"].concat(startProcessString.split(" "));

      let env   = process.env;
      // env.DEBUG = "eqemu-admin:*"

      require('child_process').spawn("cmd.exe", startArgs,
        {
          env: env,
          detached: true,
          stdio: 'ignore',
          cwd: pathManager.getEmuServerPath()
        }
      );

      config.setAdminPanelConfig('launcher.isRunning', true);
      console.log("[Process Manager] Starting server launcher...");
    }

    this.purgeServerLogs();

    debug('[startServerLauncher] Start string [%s]', startProcessString);

    return this;
  },

  /**
   * @param options
   */
  async cancelRestart(options = []) {
    if (options.cancel) {
      this.cancelTimedRestart  = true;
      this.cancelTimedShutdown = true;
      await serverDataService.messageWorld('[SERVER MESSAGE] Server stop cancelled');
    }
  },

  /**
   * @returns {exports}
   */
  restartServer: async function (options = []) {
    this.init(options, true);

    // reset timed restart if triggered restart again
    this.cancelTimedRestart = false;

    // delayed restart
    if (options.timer && options.timer > 0) {
      const startTime     = Math.floor(new Date() / 1000);
      const endTime       = startTime + parseInt(options.timer);
      let rebootTime      = false;
      let lastWarningTime = Math.floor(new Date() / 1000) - 1000;

      while (!rebootTime) {
        const minutesRemaining = (endTime - Math.floor(new Date() / 1000)) / 60;
        const unixTimeNow      = Math.floor(new Date() / 1000);

        if ((lastWarningTime + 30) <= unixTimeNow) {
          lastWarningTime = unixTimeNow;

          const worldMessage = util.format(
            '[SERVER MESSAGE] The world will be coming down for a reboot in [%s] minute(s), please log out before this time...',
            Number((minutesRemaining).toFixed(2))
          );

          await serverDataService.messageWorld(worldMessage);

          debug('Sending world message | %s', worldMessage);
        }

        if (unixTimeNow > endTime) {
          rebootTime = true;
        }

        if (this.cancelTimedRestart) {
          break;
        }

        await this.sleep(1000);
      }
    }

    if (this.cancelTimedRestart) {
      debug('Reboot cancelled');
      return false;
    }

    this.stopServer();

    setTimeout(() => {
      this.startServerLauncher();
    }, 300)

    return this;
  },

  /**
   * @param ms
   * @returns {Promise<any>}
   */
  sleep: function (ms) {
    return new Promise(resolve => {
      setTimeout(resolve, ms);
    });
  },

  /**
   * @returns {Promise<number>}
   */
  getBootedZoneCount: async function () {
    const zoneList              = await serverDataService.getZoneList();
    this.zoneBootedProcessCount = 0;

    if (!zoneList) {
      return 0;
    }

    zoneList.forEach((zone) => {
      if (zone.zone_id > 0) {
        this.zoneBootedProcessCount++;
      }
    });

    // we don't want statics to count against our dynamic booted pool...
    this.zoneBootedProcessCount -= this.onlineStatics.length;
    if (this.zoneBootedProcessCount < 0) {
      this.zoneBootedProcessCount = 0
    }

    return this.zoneBootedProcessCount;
  },

  /**
   * @param process_name
   * @param args
   * @returns {Promise<void>}
   */
  startProcess: async function (process_name, args = []) {
    let argString = '';

    // console.log("starting process", process_name)

    if (args.length > 0) {
      argString = args.join(" ")
    }

    let startProcessString = '';
    if (os.isWindows()) {
      startProcessString =
        util.format('bin\\%s',
          process_name + '.exe',
        );

      let startArgs = ["/c", "start", "/B"].concat(startProcessString.split(" ")).concat(args);
      require('child_process').spawn("cmd.exe", startArgs,
        {
          detached: true,
          stdio: 'ignore',
          cwd: pathManager.getEmuServerPath()
        }
      );
    }

    if (os.isLinux()) {
      startProcessString =
        util.format('nohup ./bin/%s %s 1>/dev/null 2>/dev/null &',
          process_name,
          argString
        );

      require('child_process').spawn(startProcessString,
        {
          cwd: pathManager.getEmuServerPath(),
          encoding: 'utf8',
          shell: '/bin/bash',
          detached: true
        }
      );
    }

    debug('Starting process [%s] command [%s] path [%s]',
      process_name,
      startProcessString,
      pathManager.getEmuServerPath()
    );

    // we don't count statics
    if (process_name === "zone" && args.length > 0) {
      return
    }

    this.processCount[process_name]++;
  },

  /**
   * @param process_id
   */
  killProcess: function (process_id) {
    try {
      if (os.isLinux()) {
        require('child_process').execSync('kill -9 ' + process_id);
      }
      if (os.isWindows()) {
        require('child_process').execSync(util.format('TASKKILL /PID %s /F', process_id));
      }
    } catch (e) {
      console.log(e);
    }
  },

  /**
   * @returns {Promise<void>}
   */
  pollProcessList: async function () {
    this.systemProcessList = await this.getProcessList();

    this.serverProcessNames.forEach((process_name) => {
      this.processCount[process_name] = 0;
    });

    this.onlineStatics = []
    this.systemProcessList.forEach((process) => {

      // statics
      if (process.cmd.includes("zone") && process.cmd.includes(" ")) {
        try {
          const zone = process.cmd.split(" ")[1].trim()
          this.onlineStatics.push(zone)

          // return because we don't want to count statics
          return
        } catch (e) {
        }
      }

      // dynamics
      if (this.serverProcessNames.includes(process.name)) {
        this.processCount[process.name]++;
      }
    });

  },

  async getProcessList() {
    let processList = [];

    if (os.isLinux()) {
      processList = await psList();
    }

    if (os.isWindows()) {
      const stdout = require('child_process')
        .execSync("WMIC path win32_process get Description,Commandline,Processid /format:csv")
        .toString();

      stdout.split('\n').forEach((row) => {
        if (row.includes(",") && !row.includes("Description,ProcessId")) {
          if (row.split(",").length > 2) {
            const splitRow          = row.split(",");
            const splitLength       = splitRow.length;
            const processId         = splitRow[splitLength - 1].trim();
            const simpleProcessName = splitRow[splitLength - 2].replace('.exe', '').trim();
            const cmdlineSplit      = row
              .replace("," + splitRow[splitLength - 1].trim(), '')
              .replace("," + splitRow[splitLength - 2].trim(), '')
              .split(",");

            let commandLine = "";
            if (cmdlineSplit.length > 1) {
              commandLine = cmdlineSplit[1].trim();
            }

            let proc = {
              "name": simpleProcessName,
              "pid": processId,
              "cmd": commandLine.replace(/\s+/g, ' ')
            };

            // Windows 11 has different formatting -_-
            // Node,CommandLine,Description,ProcessId
            if (splitRow[0].includes("WIN11")) {
              proc.cmd = splitRow[1].trim();
              proc.name = splitRow[2].trim();
              proc.pid = splitRow[3].trim();
            }

            processList.push(proc);
          }
        }
      });
    }

    return processList;
  },

  /**
   * @returns {Promise<{world: number, ucs: number, zone: number, queryserv: number, loginserver: number}>}
   */
  getProcessCounts: async function () {
    await this.pollProcessList();

    return {
      'zone': this.processCount['zone'] + this.onlineStatics.length,
      'world': this.processCount['world'],
      'ucs': this.processCount['ucs'],
      'queryserv': this.processCount['queryserv'],
      'loginserver': this.processCount['loginserver']
    };
  },

  /**
   * @param processName
   * @returns {Promise<void>}
   */
  isProcessRunning: async function (processName) {
    const cmd = (() => {
      switch (process.platform) {
        case 'win32' :
          return `tasklist`;
        case 'darwin' :
          return `ps -ax | grep ${processName}`;
        case 'linux' :
          return `ps axco command`;
        default:
          return false;
      }
    })();

    const stdout = require('child_process').execSync(cmd).toString();

    let foundProcess = false;
    stdout.split('\n').forEach(function (row) {
      if (row.toLowerCase().trim() === processName.toLowerCase().trim()) {
        foundProcess = true;
      }
    });

    debug('[isProcessRunning] found process [%s] [%s]', processName, foundProcess);

    return foundProcess;
  },

  /**
   * Purges server logs
   */
  purgeServerLogs() {
    exec('rm -rf logs/zone/*.log', { cwd: pathManager.emuServerPath });
    exec('rm -rf logs/*.log', { cwd: pathManager.emuServerPath });
  },

  /**
   * Monitors server launcher for communication drift with world to be restarted
   */
  startWatchDog() {
    this.watchDogTimer = setInterval(() => {

      let processStatus = {
        'Zone Processes': this.processCount['zone'],
        'Booted Zone Processes': this.zoneBootedProcessCount,
        'World Processes': this.processCount['world'],
        'Loginserver Processes': this.processCount['loginserver'],
        'UCS Processes': this.processCount['ucs'],
        'Watchdog Polling Delta': this.getWatchDogPollDelta() + ' / ' + MAX_PROCESS_POLL_DELTA_SECONDS_BEFORE_KILL
      };

      console.table(processStatus);

      if (this.getWatchDogPollDelta() > MAX_PROCESS_POLL_DELTA_SECONDS_BEFORE_KILL) {
        console.log('HIT WATCHDOG THRESHOLD. TERMINATING...');

        const data    = new Date() + ' watchdog killed launcher\n';
        const logFile = pathManager.getEmuServerPath() + '/logs/launcher-watchdog-kill.log';

        if (fs.existsSync(logFile)) {
          fs.appendFileSync(logFile, data);
        } else {
          fs.writeFileSync(logFile, data);
        }

        process.exit();
      }

    }, WATCHDOG_TIMER);
  }
};
