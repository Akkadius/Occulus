/**
 * server-process-manager.js
 */
const {exec, execSync}  = require('child_process');
const serverDataService = require('./eqemu-data-service-client.js');
const pathManager       = require('./path-manager');
const fs                = require('fs');
const path              = require('path');
const util              = require('util');
const psList            = require('ps-list');
const debug             = require('debug')('eqemu-admin:process-manager');
const config            = require('./eqemu-config-service');
const systemProc        = require('process');
const os                = use('/app/core/operating-system');

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
  systemProcessList: {},
  launchOptions: {},
  watchDogTimer: null,
  cancelTimedRestart: false,
  lastProcessPollTime: Math.floor(new Date() / 1000),

  /**
   * Launcher initialization
   * @param options
   * @param skipConfigWatch
   */
  init: function (options, skipConfigWatch = false) {
    this.launchOptions = options;

    process.title = "eqemu-server-launcher";

    config.init(skipConfigWatch);

    let self = this;
    this.serverProcessNames.forEach(function (process_name) {
      self.erroredStartsCount[process_name]    = 0;
      self.hasErroredHaltMessage[process_name] = 0;
      self.processCount[process_name]          = 0;
    });
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
    let self           = this;
    this.serverProcessNames.forEach(function (processName) {
      if (self.processCount[processName] > 0) {
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
        execSync('./bin/shared_memory', {cwd: pathManager.emuServerPath}).toString();
      }

      if (os.isWindows()) {
        execSync('bin\\shared_memory', {cwd: pathManager.emuServerPath}).toString();
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
      let self = this;
      for (const process_name of ['loginserver', 'ucs', 'world', 'queryserv']) {
        if (self.doesProcessNeedToBoot(process_name) && !await self.isProcessRunning(process_name)) {
          debug('starting unique process [' + process_name + ']');
          self.startProcess(process_name);
        }
      }

      /**
       * Zone
       */
      while (this.doesProcessNeedToBoot('zone')) {
        await self.startProcess('zone');
      }

      await this.sleep(LAUNCHER_MAIN_LOOP_TIMER);

      this.lastProcessPollTime = Math.floor(new Date() / 1000);
    }
  },

  /**
   * @param process_name
   * @returns {boolean}
   */
  doesProcessNeedToBoot: function (process_name) {
    if (this.erroredStartsCount[process_name] >= this.erroredStartsMaxHalt) {
      if (!this.hasErroredHaltMessage[process_name]) {
        console.error('Process [%s] has tried to boot too many (%s) times... Halting attempts', process_name, this.erroredStartsMaxHalt);
        this.hasErroredHaltMessage[process_name] = 1;
      }

      return false;
    }

    if (process_name === 'zone' &&
      this.processCount[process_name] < (this.zoneBootedProcessCount + config.getAdminPanelConfig('launcher.minZoneProcesses', 3))) {

      return true;
    }

    if (process_name === 'loginserver') {
      return this.launchOptions && this.launchOptions.withLoginserver && this.processCount[process_name] === 0;
    }

    if (process_name === 'queryserv') {
      return this.launchOptions && this.launchOptions.withQueryserv && this.processCount[process_name] === 0;
    }

    debug('[doesProcessNeedToBoot] [%s] returning [%s]', process_name, this.processCount[process_name] === 0);

    return this.processCount[process_name] === 0;
  },

  /**
   * @param zone_short_name
   * @returns {Promise<void>}
   */
  startStaticZone: async function (zone_short_name) {
    return await this.startProcess('zone', [zone_short_name]);
  },

  /**
   * @returns {Promise<void>}
   */
  stopServer: async function () {
    this.init([], true);

    await this.pollProcessList();
    let self = this;

    debug('[stopServer] Stopping server...');

    /**
     * Kill launcher
     */
    this.systemProcessList.forEach(function (process) {
      if (process.cmd.includes('server-launcher')) {
        self.killProcess(process.pid);

        debug('[stopServer] Killing launcher [%s] pid [%s]', process.name, process.pid);
      }
    });

    /**
     * Kill server processes
     */
    this.systemProcessList.forEach(function (process) {
      if (self.serverProcessNames.includes(process.name)) {
        self.killProcess(process.pid);

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
          proc.cmd.includes('admin') &&
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

      require('child_process').exec(startProcessString);

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
      this.cancelTimedRestart = true;
      await serverDataService.messageWorld('[SERVER MESSAGE] Server restart cancelled');
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

    let self = this;
    setTimeout(function () {
      self.startServerLauncher();
    }, 300);

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
    const zone_list             = await serverDataService.getZoneList();
    this.zoneBootedProcessCount = 0;
    let self                    = this;

    if (!zone_list) {
      return 0;
    }

    zone_list.forEach(function (zone) {
      if (zone.zone_id > 0) {
        self.zoneBootedProcessCount++;
      }
    });

    return this.zoneBootedProcessCount;
  },

  /**
   * @param process_name
   * @param args
   * @returns {Promise<void>}
   */
  startProcess: async function (process_name, args = []) {
    let argString = '';
    args.forEach(function (arg) {
      argString += arg + ' ';
    });

    let startProcessString = '';
    if (os.isWindows()) {
      startProcessString =
        util.format('bin\\%s',
          process_name + '.exe'
        );

      require('child_process').spawn(startProcessString,
        {
          cwd: pathManager.emuServerPath,
          detached: true,
          stdio: 'ignore',
          windowsHide: false
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
          cwd: pathManager.emuServerPath,
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

    let self = this;
    this.serverProcessNames.forEach(function (process_name) {
      self.processCount[process_name] = 0;
    });

    this.systemProcessList.forEach(function (process) {
      if (self.serverProcessNames.includes(process.name)) {
        self.processCount[process.name]++;
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
            const commandLine       = row
              .replace("," + splitRow[splitLength - 1].trim(), '')
              .replace("," + splitRow[splitLength - 2].trim(), '')
              .split(",")[1].trim()
            ;

            processList.push(
              {
                "name": simpleProcessName,
                "pid": processId,
                "cmd": commandLine
              }
            );
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
      'zone': this.processCount['zone'],
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
    exec('rm -rf logs/zone/*.log', {cwd: pathManager.emuServerPath});
    exec('rm -rf logs/*.log', {cwd: pathManager.emuServerPath});
  },

  /**
   * Monitors server launcher for communication drift with world to be restarted
   */
  startWatchDog() {
    let self           = this;
    this.watchDogTimer = setInterval(function () {

      let processStatus = {
        'Zone Processes': self.processCount['zone'],
        'Booted Zone Processes': self.zoneBootedProcessCount,
        'World Processes': self.processCount['world'],
        'Loginserver Processes': self.processCount['loginserver'],
        'UCS Processes': self.processCount['ucs'],
        'Watchdog Polling Delta': self.getWatchDogPollDelta() + ' / ' + MAX_PROCESS_POLL_DELTA_SECONDS_BEFORE_KILL
      };

      console.table(processStatus);

      if (self.getWatchDogPollDelta() > MAX_PROCESS_POLL_DELTA_SECONDS_BEFORE_KILL) {
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
