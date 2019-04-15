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
  erroredStartsCount    : {},
  hasErroredHaltMessage : {},
  erroredStartsMaxHalt  : 5,
  minZoneProcesses      : 3,
  processCount          : {},
  serverProcessNames    : ["zone", "world", "ucs", "queryserv", "loginserver"],
  systemProcessList     : {},

  init : function () {
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
  start : async function (options) {

    this.init();

    while (1) {
      await this.pollProcessList();

      let self = this;

      ["loginserver", "ucs", "world", "queryserv"].forEach(function (process_name) {
        if (self.doesProcessNeedToBoot(process_name)) {
          self.startProcess(process_name);
        }
      });

      while (this.doesProcessNeedToBoot("zone")) {
        await self.startProcess("zone");
      }

      console.log("Zone Processes: '%s'", this.processCount["zone"]);
      console.log("World Process: '%s'", this.processCount["world"]);
      console.log("UCS Process: '%s'", this.processCount["ucs"]);
      console.log("Booted Zone Processes: '%s'", this.zoneBootedProcessCount);

      await this.sleep(5000);
    }
  },

  doesProcessNeedToBoot : function (process_name) {
    if (this.erroredStartsCount[process_name] >= this.erroredStartsMaxHalt) {
      if (!this.hasErroredHaltMessage[process_name]) {
        console.error("Process '%s' has tried to boot too many (%s) times... Halting attempts", process_name, this.erroredStartsMaxHalt)
        this.hasErroredHaltMessage[process_name] = 1;
      }

      return false;
    }

    if (process_name === "zone" &&
      this.processCount[process_name] < (this.zoneBootedProcessCount + this.minZoneProcesses)) {

      return true;
    }

    return this.processCount[process_name] === 0;
  },

  startStaticZone : async function (zone_short_name) {
    return await this.startProcess("zone", [zone_short_name]);
  },

  /**
   * @returns {Promise<void>}
   */
  stopServer : async function () {
    this.systemProcessList = await require("process-list").snapshot('pid', 'name', 'threads', 'cmdline');
    let self               = this;

    this.systemProcessList.forEach(function (process) {
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

    this.processCount[process_name]++;

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

    if (typeof this.erroredStartsCount[process_name] === "undefined") {
      this.erroredStartsCount[process_name] = 0;
    }

    this.erroredStartsCount[process_name]++;

    console.log(this.erroredStartsCount);

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
    this.systemProcessList = await require("process-list").snapshot('pid', 'name', 'threads', 'cmdline');

    let self = this;
    this.serverProcessNames.forEach(function (process_name) {
      self.processCount[process_name] = 0;
    });

    this.systemProcessList.forEach(function (process) {
      if (self.serverProcessNames.includes(process.name)) {
        self.processCount[process.name]++;
      }
    });

    await this.getBootedZoneCount();
  },

  /**
   * @returns {Promise<{world: number, ucs: number, zone: number, queryserv: number, loginserver: number}>}
   */
  getProcessCounts : async function () {
    await this.pollProcessList();

    return {
      "zone"        : this.processCount["zone"],
      "world"       : this.processCount["world"],
      "ucs"         : this.processCount["ucs"],
      "queryserv"   : this.processCount["queryserv"],
      "loginserver" : this.processCount["loginserver"],
    };
  }
  ,
}
;