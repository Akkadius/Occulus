/**
 * server-process-manager.js
 */
const { exec }          = require('child_process');
const serverDataService = require('./eqemu-data-service-client.js');
const pathManager       = require('./path-manager');
const fs                = require('fs');
const path              = require('path')
const os                = require('os')
const util              = require('util')
const psList            = require('ps-list');
const debug             = require('debug')('eqemu-admin:process-manager');

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
  lastProcessPollTime: Math.floor(new Date() / 1000),

  /**
   * Launcher initialization
   * @param options
   */
  init: function (options) {
    this.launchOptions = options;

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
     * Start watchdog
     * @type {module.exports}
     */
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

    this.systemProcessList.forEach(function (process) {
      if (self.serverProcessNames.includes(process.name) || process.cmd.includes('server-launcher')) {
        self.killProcess(process.pid);
      }
    });

    return this;
  },

  /**
   * @returns {exports}
   */
  startServerLauncher: async function (options) {

    let args = [];
    if (options) {
      args.push(options);
    }

    let argString = '';
    args.forEach(function (arg) {
      argString += arg + ' ';
    });

    /**
     * Check if launcher is booted first
     * @type {boolean}
     */
    let isLauncherBooted = false;
    await this.pollProcessList();
    this.systemProcessList.forEach(function (process) {
      if (process.cmd.includes('server-launcher')) {
        isLauncherBooted = true;
      }
    });

    if (isLauncherBooted) {
      console.log('Launcher is already booted');
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

    debug('start string [%s]', startProcessString);
    debug('cwd [%s]', path.join(path.dirname(process.argv[0]), '../'));

    exec(startProcessString,
      {
        encoding: 'utf8',
        cwd: path.join(path.dirname(process.argv[0]), '../')
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

    return this;
  },

  /**
   * @returns {exports}
   */
  restartServer: async function () {
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

    let is_windows           = process.platform === 'win32';
    let is_linux             = process.platform === 'linux';
    let start_process_string = '';
    if (is_windows) {
      start_process_string = process_name + '.exe';
    }

    if (is_linux) {
      start_process_string =
        util.format('./bin/%s %s &',
          process_name,
          argString
        );
    }

    debug('Starting process [%s] command [%s] path [%s]',
      process_name,
      start_process_string,
      pathManager.getEmuServerPath()
    );

    const child = exec(
      start_process_string,
      {
        cwd: pathManager.emuServerPath,
        encoding: 'utf8'
      }
    );

    this.processCount[process_name]++;

    // console.log('stdout ', child);
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
  }
};
