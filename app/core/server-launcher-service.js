const {spawn}           = require("child_process");
const serverDataService = require(app_root + '/app/core/eqemu-data-service-client.js');

/**
 * @type {{check: module.exports.check}}
 */
module.exports = {
  processList: {},
  zoneProcessCount: 0,
  zoneBootedProcessCount: 0,
  worldProcessCount: 0,
  ucsProcessCount: 0,
  qsProcessCount: 0,
  loginServerProcessCount: 0,
  minZoneProcesses: 3,
  serverProcessNames: ["zone", "world", "ucs", "queryserv", "loginserver"],

  /**
   * @param options
   * @returns {Promise<void>}
   */
  start: async function (options) {
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
        this.startLoginserver();
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
    // console.log(app_root);

  },

  /**
   * @returns {Promise<void>}
   */
  stopServer: async function () {
    this.processList = await require("process-list").snapshot('pid', 'name', 'threads');
    let self         = this;
    let ps           = require('ps-node');

    this.processList.forEach(function (process) {
      if (self.serverProcessNames.includes(process.name)) {
        ps.kill(process.pid, function (err) {
          if (err) {
            // throw new Error(err);
          } else {
            console.log("Killing PID: %s Name: %s", process.pid, process.name);
          }
        });
      }
    });
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
      return;
    }

    zone_list.forEach(function (zone) {
      if (zone.zone_id > 0) {
        self.zoneBootedProcessCount++;
      }
    });

    return this.zoneBootedProcessCount;
  },

  startWorld: function () {
    this.startProcess('world');
    this.worldProcessCount++;
  },

  startZone: function () {
    this.startProcess('zone');
    this.zoneProcessCount++;
  },

  startLoginserver: function () {
    this.startProcess('loginserver');
    this.loginServerProcessCount++;
  },

  startUcs: function () {
    this.startProcess('ucs');
    this.ucsProcessCount++;
  },

  startQueryServ: function () {
    this.startProcess('queryserv');
    this.qsProcessCount++;
  },

  /**
   * @param process_name
   * @returns {Promise<void>}
   */
  startProcess: async function (process_name) {
    // let is_windows = process.platform === "win32";
    // let is_linux   = process.platform === "linux";

    console.log("starting process '%s'", process_name);

    const child = await spawn('./' + process_name, [], {
      detached: true,
      // stdio: 'ignore',
      cwd: server_root
    });

    child.stderr.on('data', function (data) {
      console.log('stderr: ' + data);
    });

    child.unref();
  },

  /**
   * @returns {Promise<void>}
   */
  pollProcessList: async function () {
    this.processList             = await require("process-list").snapshot('pid', 'name', 'threads');
    this.zoneProcessCount        = 0;
    this.worldProcessCount       = 0;
    this.ucsProcessCount         = 0;
    this.qsProcessCount          = 0;
    this.loginServerProcessCount = 0;

    let self = this;

    this.processList.forEach(function (process) {
      // console.log(process);

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
};