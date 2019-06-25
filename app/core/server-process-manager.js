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

  /**
   * Launcher initialization
   * @param options
   */
  init: function (options) {
    this.launchOptions = options;

    console.log(this.launchOptions)

    let self = this;
    this.serverProcessNames.forEach(function (process_name) {
      self.erroredStartsCount[process_name]    = 0;
      self.hasErroredHaltMessage[process_name] = 0;
      self.processCount[process_name]          = 0;
    });
  },

  /**
   * @param options
   * @returns {Promise<void>}
   */
  start: async function (options = []) {
    this.init(options);

    while (1) {
      await this.pollProcessList();
      await this.getBootedZoneCount();

      /**
       * Single processes
       * @type {exports}
       */
      let self = this;
      ['loginserver', 'ucs', 'world', 'queryserv'].forEach(function (process_name) {
        if (self.doesProcessNeedToBoot(process_name)) {
          self.startProcess(process_name);
        }
      });

      /**
       * Zone
       */
      while (this.doesProcessNeedToBoot('zone')) {
        await self.startProcess('zone');
      }

      console.log('Zone Processes: \'%s\'', this.processCount['zone']);
      console.log('World Process: \'%s\'', this.processCount['world']);
      console.log('Loginserver Process: \'%s\'', this.processCount['loginserver']);
      console.log('UCS Process: \'%s\'', this.processCount['ucs']);
      console.log('Booted Zone Processes: \'%s\'', this.zoneBootedProcessCount);

      await this.sleep(5000);
    }
  },

  /**
   * @param process_name
   * @returns {boolean}
   */
  doesProcessNeedToBoot: function (process_name) {
    if (this.erroredStartsCount[process_name] >= this.erroredStartsMaxHalt) {
      if (!this.hasErroredHaltMessage[process_name]) {
        console.error('Process \'%s\' has tried to boot too many (%s) times... Halting attempts', process_name, this.erroredStartsMaxHalt)
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
      if (self.serverProcessNames.includes(process.name) || process.cmdline.includes('server_launcher')) {
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
    let is_launcher_booted = false;
    await this.pollProcessList();
    this.systemProcessList.forEach(function (process) {
      if (process.cmdline.includes('server_launch')) {
        is_launcher_booted = true;
      }
    });

    if (is_launcher_booted) {
      console.log('Launcher is already booted');
      return false;
    }

    let start_process_string = '';

    // TODO: Windows
    if (process.platform === 'linux') {
      start_process_string = util.format(
        'node cli.js server_launcher %s &',
        argString
      );
    }

    console.log(start_process_string);

    exec(start_process_string,
      {
        cwd: pathManager.getAppRootPath(),
        encoding: 'utf8'
      },
      (error, stdout, stderr) => {
        if (error) {
          console.error(`exec error: ${error}`);
          return;
        }
        // console.log(`stdout: ${stdout}`);
        // console.log(`stderr: ${stderr}`);
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
    const logRedirectDir = path.join(os.tmpdir(), 'admin-process-logs');
    if (!fs.existsSync(logRedirectDir)) {
      fs.mkdirSync(logRedirectDir);
    }

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
        util.format('./bin/%s %s 1> %s_$$.txt &',
          process_name,
          argString,
          path.join(logRedirectDir, process_name)
        );
    }

    console.debug('Starting process [%s] command [%s] path [%s]',
      process_name,
      start_process_string,
      pathManager.emuServerPath
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
   * @param process_name
   * @param args
   * @param data
   */
  handleProcessError: function (process_name, args, data) {
    console.error('[Error] Process \'%s\' via path: \'%s\', with args failed to start [%s]\n%s',
      process_name,
      pathManager.emuServerPath,
      args,
      data
    );

    if (typeof this.erroredStartsCount[process_name] === 'undefined') {
      this.erroredStartsCount[process_name] = 0;
    }

    this.erroredStartsCount[process_name]++;
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
  }

}
;
