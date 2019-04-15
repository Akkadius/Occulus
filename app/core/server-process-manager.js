/**
 * server-process-manager.js
 */
const { spawn }         = require("child_process");
const serverDataService = require('./eqemu-data-service-client.js');
const pathManager       = require('./path-manager');

/**
 * @type {{check: module.exports.check}}
 */
module.exports = {
  processList             : {},
  zoneProcessCount        : 0,
  zoneBootedProcessCount  : 0,
  worldProcessCount       : 0,
  ucsProcessCount         : 0,
  qsProcessCount          : 0,
  loginServerProcessCount : 0,
  minZoneProcesses        : 3,
  serverProcessNames      : ["zone", "world", "ucs", "queryserv", "loginserver"],

  /**
   * @param options
   * @returns {Promise<void>}
   */
  start : async function (options) {
    while (1) {
      await this.pollProcessList();

      if (this.worldProcessCount === 0) {
        this.startWorld();
      }

      if (this.qsProcessCount === 0) {
        this.startQueryServ();
      }

      if (this.ucsProcessCount === 0) {
        this.startUcs();
      }

      if (this.loginServerProcessCount === 0) {
        this.startLoginServer();
      }

      while (this.zoneProcessCount < (this.zoneBootedProcessCount + this.minZoneProcesses)) {
        this.startZone();
      }

      /// console.log(options.withLoginserver);

      console.log("Zone Processes: '%s'", this.zoneProcessCount);
      console.log("World Process: '%s'", this.worldProcessCount);
      console.log("UCS Process: '%s'", this.ucsProcessCount);
      console.log("Booted Zone Processes: '%s'", this.zoneBootedProcessCount);

      await this.sleep(5000);
    }
  },

  startStaticZone : async function (zone_short_name) {
    return await this.startProcess("zone", [zone_short_name]);
  },

  /**
   * @returns {Promise<void>}
   */
  stopServer : async function () {
    this.processList = await require("process-list").snapshot('pid', 'name', 'threads', 'cmdline');
    let self         = this;

    this.processList.forEach(function (process) {
      if (self.serverProcessNames.includes(process.name) || process.cmdline.includes("server_launcher")) {
        self.killProcess(process.pid);
      }
    });

    return this;
  },

  /**
   * @returns {exports}
   */
  startServerLauncher : async function () {
    const child_process = await spawn('node', ['cli.js', 'server_launcher'], {
      detached : true,
      stdio    : 'ignore',
      cwd      : pathManager.appRoot
    });
    child_process.unref();

    return this;
  },

  /**
   * @returns {exports}
   */
  restartServer : async function () {
    this.stopServer();
    this.startServerLauncher();

    return this;
  },

  /**
   * @param ms
   * @returns {Promise<any>}
   */
  sleep : function (ms) {
    return new Promise(resolve => {
      setTimeout(resolve, ms)
    });
  },

  /**
   * @returns {Promise<number>}
   */
  getBootedZoneCount : async function () {
    const zone_list             = await serverDataService.getZoneList();
    this.zoneBootedProcessCount = 0;
    let self                    = this;

    if (!zone_list) {
      return;
    }

    zone_list.forEach(function (zone) {
      if (zone.zone_id > 0) {
        self.zoneBootedProcessCount++;
      }
    });

    return this.zoneBootedProcessCount;
  },

  startWorld : function () {
    this.startProcess('world');
    this.worldProcessCount++;
  },

  startZone : function () {
    this.startProcess('zone');
    this.zoneProcessCount++;
  },

  startLoginServer : function () {
    this.startProcess('loginserver');
    this.loginServerProcessCount++;
  },

  startUcs : function () {
    this.startProcess('ucs');
    this.ucsProcessCount++;
  },

  startQueryServ : function () {
    this.startProcess('queryserv');
    this.qsProcessCount++;
  },

  /**
   * @param process_name
   * @param args
   * @returns {Promise<void>}
   */
  startProcess : async function (process_name, args = []) {
    let is_windows           = process.platform === "win32";
    let is_linux             = process.platform === "linux";
    let start_process_string = "";
    if (is_windows) {
      start_process_string = process_name + '.exe';
    }
    if (is_linux) {
      start_process_string = './' + process_name;
    }

    console.debug("Starting process '%s' via path: '%s' with args '%s'",
      process_name,
      pathManager.emuServerPath,
      args
    );

    const child = await spawn(
      start_process_string,
      args,
      {
        detached : true,
        cwd      : pathManager.emuServerPath
      }
    );

    const self = this;

    child.stdout.on('data', (data) => {
      if (/\[Error]|Error/i.test(data)) {
        self.handleProcessError(process_name, args, data);
      }
    });

    child.stderr.on('data', (data) => {
      if (/\[Error]|Error/i.test(data)) {
        self.handleProcessError(process_name, args, data);
      }
    });

    child.unref();
  },

  handleProcessError : function (process_name, args, data) {
    console.error("[Error] Process '%s' via path: '%s', with args failed to start [%s]\n%s",
      process_name,
      pathManager.emuServerPath,
      args,
      data
    );
  },

  killProcess : function (process_id) {
    try {
      require('child_process').execSync("kill -9 " + process_id);
    } catch (e) {
      console.log(e);
    }
  },

  /**
   * @returns {Promise<void>}
   */
  pollProcessList : async function () {
    this.processList             = await require("process-list").snapshot('pid', 'name', 'threads', 'cmdline');
    this.zoneProcessCount        = 0;
    this.worldProcessCount       = 0;
    this.ucsProcessCount         = 0;
    this.qsProcessCount          = 0;
    this.loginServerProcessCount = 0;
    let self                     = this;

    this.processList.forEach(function (process) {
      if (process.name === "zone") {
        self.zoneProcessCount++;
      }
      if (process.name === "world") {
        self.worldProcessCount++;
      }
      if (process.name === "ucs") {
        self.ucsProcessCount++;
      }
      if (process.name === "queryserv") {
        self.qsProcessCount++;
      }
      if (process.name === "loginserver") {
        self.loginServerProcessCount++;
      }
    });

    await this.getBootedZoneCount();
  }

  ,

  /**
   * @returns {Promise<{world: number, ucs: number, zone: number, queryserv: number, loginserver: number}>}
   */
  getProcessCounts : async function () {
    await this.pollProcessList();

    return {
      "zone"        : this.zoneProcessCount,
      "world"       : this.worldProcessCount,
      "ucs"         : this.ucsProcessCount,
      "queryserv"   : this.qsProcessCount,
      "loginserver" : this.loginServerProcessCount,
    };
  }
  ,
}
;