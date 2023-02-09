/**
 * HRM.js
 * @type {{exec: module.exports.exec}}
 */
const serverDataService  = use('/app/core/eqemu-data-service-client')
const pathManager        = use('/app/core/path-manager')
const debug              = require('debug')('eqemu-admin:HRM')
const watch              = require('node-watch');
const database           = use('/app/core/database')
const eqemuConfigService = use('/app/core/eqemu-config-service')
const chalk              = require('chalk');
const util               = require('util');
const path               = require('path');
const fs                 = require("fs");
const config             = require("./eqemu-config-service");
const zoneRepository     = use('/app/repositories/zoneRepository');

const getAllFiles = dir =>
  fs.readdirSync(dir).reduce((files, file) => {
    const name        = path.join(dir, file);
    const isDirectory = fs.statSync(name).isDirectory();
    return isDirectory ? [...files, ...getAllFiles(name)] : [...files, name];
  }, []);

module.exports = {
  zones: null,

  // pointer to the watcher(s)
  questWatcher: null,
  pluginWatcher: null,
  luaModulesWatcher: null,

  // keeps track of file sizes to prevent no-op reloads
  fileSizeMap: {},

  loadZones: async function () {
    this.zones = await zoneRepository.all();

    debug('[%s] Zones loaded', this.zones.length)
  },

  doesZoneExist: function (zoneShortName) {
    let zoneExists = false;
    this.zones.forEach(function (row) {
      if (row.short_name === zoneShortName) {
        zoneExists = true;
      }
    });

    return zoneExists;
  },

  message: function (message) {
    console.log(util.format(chalk`{green [{bold HRM}] %s }`, message))
  },

  loadPathIntoFileSizeMap: function (filePath) {
    const files = getAllFiles(filePath).filter((f) => {
      return !f.includes(".git") && (f.includes(".pl") || f.includes(".lua"))
    });

    for (let f of files) {
      const filename                             = path.basename(f)
      const dirname                              = path.basename(path.dirname(f))
      const key = dirname + '/' + filename
      this.fileSizeMap[key] = fs.statSync(f).size;
    }
  },

  checkIfModified: function (f) {
    const filename = path.basename(f)
    const dirname  = path.basename(path.dirname(f))
    const size     = fs.statSync(f).size
    const key = dirname + '/' + filename

    if (!this.fileSizeMap[key]) {
      this.fileSizeMap[key] = size
    }
    else if (this.fileSizeMap[key] && this.fileSizeMap[key] === size) {
      this.message(util.format(
        chalk`[{bold lua_modules}] File [{bold %s}] event triggered but size didn't actually change, a 3rd party program might be suspect`,
        filename
      ));

      return true
    }

    this.fileSizeMap[key] = size;

    return false
  },

  /**
   * @return {boolean}
   */
  init: async function (options) {
    await eqemuConfigService.init(true);
    await database.init();
    await this.loadZones();

    this.message('Starting HRM listener (Hot-Reload Module) v1.0')
    this.message(util.format(chalk`Watching scripts [{bold %s}]`, pathManager.getEmuQuestsPath()))
    this.message(util.format(chalk`Watching scripts [{bold %s}]`, pathManager.getEmuLuaModulesPath()))
    this.message(util.format(chalk`Watching scripts [{bold %s}]`, pathManager.getEmuPluginsPath()))

    debug('Starting listener for [%s]', pathManager.getEmuQuestsPath())

    watch(eqemuConfigService.getServerConfigPath(), (evt, file) => {
      this.message('Detected configuration change')
      console.log(chalk`{green [{bold EQEmuConfig}] [HRM] File change detected, reloading... }`);

      this.stopWatchers()

      setTimeout(() => {
        const hotReload = eqemuConfigService.getAdminPanelConfig('quests.hotReload', true)
        if (hotReload) {
          this.startWatchers();
        }

      }, 1000)
    });

    this.startWatchers()
  },

  startWatchers: function () {
    this.message('Starting watchers')

    this.startLuaModulesWatcher()
    this.startPluginsWatcher()
    this.startQuestWatcher()
  },

  stopWatchers: function () {
    this.message('Stopping watchers')

    let watchers = [
      this.luaModulesWatcher,
      this.pluginWatcher,
      this.questWatcher,
    ];

    for (let w of watchers) {
      if (w && !w.isClosed()) {
        w.close()
      }
    }

    this.luaModulesWatcher = null
    this.pluginWatcher     = null
    this.questWatcher      = null
  },

  startLuaModulesWatcher: function () {
    this.loadPathIntoFileSizeMap(pathManager.getEmuLuaModulesPath())

    this.luaModulesWatcher = watch(
      pathManager.getEmuLuaModulesPath(),
      {
        recursive: true,
        filter: f => this.watchedFiles(f)
      }, (e, file) => {
        if (e === 'update') {
          if (this.checkIfModified(file)) {
            return
          }

          const changedFile = path.dirname(file).split(path.sep).pop() + '/' + path.basename(file);

          this.message(util.format(
            chalk`[{bold lua_modules}] Reloading [{bold All Zones}] File [{bold %s}]`,
            changedFile
          ));
          serverDataService.hotReloadZoneQuests('all');
        }
      }
    );
  },

  startPluginsWatcher: function () {
    this.loadPathIntoFileSizeMap(pathManager.getEmuPluginsPath())

    this.pluginWatcher = watch(
      pathManager.getEmuPluginsPath(),
      {
        recursive: true,
        filter: f => this.watchedFiles(f)
      }, (e, file) => {
        if (e === 'update') {
          if (this.checkIfModified(file)) {
            return
          }

          const changedFile = path.dirname(file).split(path.sep).pop() + '/' + path.basename(file);

          this.message(util.format(
            chalk`[{bold plugins}] Reloading [{bold All Zones}] File [{bold %s}]`,
            changedFile
          ));

          serverDataService.hotReloadZoneQuests('all');
        }
      }
    );
  },

  startQuestWatcher: function () {
    this.loadPathIntoFileSizeMap(pathManager.getEmuQuestsPath())

    this.questWatcher = watch(
      pathManager.getEmuQuestsPath(),
      {
        recursive: true,
        filter: f => this.watchedFiles(f)
      }, (e, file) => {
        if (this.checkIfModified(file)) {
          return
        }

        this.message(util.format(chalk`[{bold Quests}] File [{bold %s}] changed`, file));

        if (e === 'update') {
          const changedFile = path.dirname(file).split(path.sep).pop() + '/' + path.basename(file);
          const changedZone = path.dirname(file).split(path.sep).pop();

          const changedData = util.format(
            chalk`File [{bold %s}]`,
            changedFile
          );

          /**
           * Zone
           */
          if (this.doesZoneExist(changedZone)) {
            this.message(util.format(chalk`[{bold zone}] Reloading [{bold %s}] %s`, changedZone, changedData));
            serverDataService.hotReloadZoneQuests(changedZone);
          }

          /**
           * Global
           */
          if (changedZone === 'global') {
            this.message(util.format(chalk`[{bold global}] Reloading [{bold %s}] %s`, 'All Zones', changedData));
            serverDataService.hotReloadZoneQuests('all');
          }
        }
      }
    );
  },
  watchedFiles: function (f) {
    return f.endsWith('.pl') || f.endsWith('.lua')
  }
};
