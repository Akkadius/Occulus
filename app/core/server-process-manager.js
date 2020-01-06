/**
 * server-process-manager.js
 */
const { exec, execSync } = require('child_process');
const serverDataService  = require('./eqemu-data-service-client.js');
const pathManager        = require('./path-manager');
const fs                 = require('fs');
const path               = require('path')
const os                 = require('os')
const util               = require('util')
const psList             = require('ps-list');
const debug              = require('debug')('eqemu-admin:process-manager');
const config             = require('./eqemu-config-service')

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
  minZoneProcesses: 3,
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
   */
  init: function (options) {
    this.launchOptions = options;

    config.init();

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
    return (Math.floor(new Date() / 1000) - this.lastProcessPollTime)
  },

  /**
   * @param options
   * @returns {Promise<void>}
   */
  start: async function (options = []) {
    this.init(options);

    /**
     * Shared memory
     */
    if (config.getAdminPanelConfig('launcher.runSharedMemory')) {
      execSync('./bin/shared_memory', { cwd: pathManager.emuServerPath }).toString();
    }

    if (config.getAdminPanelConfig('launcher.runLoginserver')) {
      debug('Running loginserver');
      this.launchOptions.withLoginserver = true;
    }

    if (config.getAdminPanelConfig('launcher.runQueryServ')) {
      debug('Running queryserv');
      this.launchOptions.withQueryserv = true;
    }

    this.startWatchDog();

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
          debug('starting unique process [' + process_name + ']')
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
        console.error('Process [%s] has tried to boot too many (%s) times... Halting attempts', process_name, this.erroredStartsMaxHalt)
        this.hasErroredHaltMessage[process_name] = 1;
      }

      return false;
    }

    if (process_name === 'zone' &&
      this.processCount[process_name] < (this.zoneBootedProcessCount + this.minZoneProcesses)) {

      return true;
    }

    if (process_name === 'loginserver') {
      return this.launchOptions && this.launchOptions.withLoginserver && this.processCount[process_name] === 0;
    }

    if (process_name === 'queryserv') {
      return this.launchOptions && this.launchOptions.withQueryserv && this.processCount[process_name] === 0;
    }

    debug('[doesProcessNeedToBoot] returning [%s]', this.processCount[process_name] === 0)

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
    this.systemProcessList = await psList();
    let self               = this;

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

    return this;
  },

  /**
   * @returns {Promise<boolean>}
   */
  async isLauncherBooted() {
    let isLauncherBooted = false;
    await this.pollProcessList();
    this.systemProcessList.forEach(function (process) {
      if (process.cmd.includes('server-launcher')) {
        isLauncherBooted = true;
      }
    });

    return isLauncherBooted;
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

    // TODO: Windows
    if (process.platform === 'linux') {
      startProcessString = util.format(
        'while : ; do PKG_EXECPATH=; nohup %s server-launcher %s && sleep 1 ; done &',
        //'PKG_EXECPATH=; nohup %s server-launcher %s &',
        pathManager.getEqemuAdminEntrypoint(),
        argString
      );
    }

    this.purgeServerLogs();

    debug('[startServerLauncher] Start string [%s]', startProcessString);

    /**
     * Start launcher
     */
    exec(startProcessString, { cwd: pathManager.emuServerPath });

    /**
     exec(startProcessString,
     {
        encoding: 'utf8',
        // cwd: path.join(path.dirname(process.argv[0]), '../')
      },
     (error, stdout, stderr) => {
        if (error) {
          debug(`exec error: ${error}`);
          return;
        }
        debug(`stdout: ${stdout}`);
        debug(`stderr: ${stderr}`);
      }
     );
     **/

    return this;
  },

  /**
   * @param options
   */
  async cancelRestart(options = []) {
    if (options.cancel) {
      this.cancelTimedRestart = true;
      await serverDataService.messageWorld("[SERVER MESSAGE] Server restart cancelled")
    }
  },

  /**
   * @returns {exports}
   */
  restartServer: async function (options = []) {

    /**
     * Delayed restart
     */
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

          await serverDataService.messageWorld(worldMessage)

          debug('Sending world message | %s', worldMessage)
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
      setTimeout(resolve, ms)
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

    let isWindows          = process.platform === 'win32';
    let isLinux            = process.platform === 'linux';
    let startProcessString = '';
    if (isWindows) {
      startProcessString = process_name + '.exe';
    }

    if (isLinux) {
      startProcessString =
        util.format('./bin/%s %s &',
          process_name,
          argString
        );
    }

    debug('Starting process [%s] command [%s] path [%s]',
      process_name,
      startProcessString,
      pathManager.getEmuServerPath()
    );

    exec(startProcessString, { cwd: pathManager.emuServerPath, encoding: 'utf8' });

    this.processCount[process_name]++;
  },

  /**
   * @param process_id
   */
  killProcess: function (process_id) {
    try {
      require('child_process').execSync('kill -9 ' + process_id);
    } catch (e) {
      console.log(e);
    }
  },

  /**
   * @returns {Promise<void>}
   */
  pollProcessList: async function () {
    this.systemProcessList = await psList();

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

    debug('[isProcessRunning] found process [%s] [%s]', processName, foundProcess)

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

        process.exit()
      }

    }, WATCHDOG_TIMER);
  }
};
