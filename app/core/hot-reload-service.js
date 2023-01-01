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
const zoneRepository     = use('/app/repositories/zoneRepository');

module.exports = {
  zones: null,

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

  /**
   * @return {boolean}
   */
  startListener: async function (options) {

    await eqemuConfigService.init();
    await database.init();
    await this.loadZones();

    this.message('Starting HRM listener (Hot-Reload Module) v1.0')
    this.message(util.format(chalk`Watching scripts [{bold %s}]`, pathManager.getEmuQuestsPath()))
    this.message(util.format(chalk`Watching scripts [{bold %s}]`, pathManager.getEmuLuaModulesPath()))
    this.message(util.format(chalk`Watching scripts [{bold %s}]`, pathManager.getEmuPluginsPath()))

    debug('Starting listener for [%s]', pathManager.getEmuQuestsPath())

    let self = this;

    /**
     * Lua Modules
     */
    watch(pathManager.getEmuLuaModulesPath(), { recursive: true }, function (evt, file) {
      if (!["lua", "pl"].includes(file.split('.').pop())) {
        return false
      }

      if (evt === 'update') {
        const changedFile = path.dirname(file).split(path.sep).pop() + '/' + path.basename(file);

        self.message(util.format(
          chalk`[{bold lua_modules}] Reloading [{bold All Zones}] File [{bold %s}]`,
          changedFile
        ));
        serverDataService.hotReloadZoneQuests('all');
      }
    });

    /**
     * Plugins
     */
    watch(pathManager.getEmuPluginsPath(), { recursive: true }, function (evt, file) {
      if (!["lua", "pl"].includes(file.split('.').pop())) {
        return false
      }

      if (evt === 'update') {
        const changedFile = path.dirname(file).split(path.sep).pop() + '/' + path.basename(file);

        self.message(util.format(
          chalk`[{bold plugins}] Reloading [{bold All Zones}] File [{bold %s}]`,
          changedFile
        ));

        serverDataService.hotReloadZoneQuests('all');
      }
    });

    /**
     * Quests
     */
    watch(pathManager.getEmuQuestsPath(), { recursive: true }, function (evt, file) {
      if (!["lua", "pl"].includes(file.split('.').pop())) {
        return false
      }

      self.message(util.format(chalk`[{bold Quests}] File [{bold %s}] changed`, file));

      if (evt === 'update') {
        const changedFile = path.dirname(file).split(path.sep).pop() + '/' + path.basename(file);
        const changedZone = path.dirname(file).split(path.sep).pop();

        const changedData = util.format(
          chalk`File [{bold %s}]`,
          changedFile
        );

        /**
         * Zone
         */
        if (self.doesZoneExist(changedZone)) {
          self.message(util.format(chalk`[{bold zone}] Reloading [{bold %s}] %s`, changedZone, changedData));
          serverDataService.hotReloadZoneQuests(changedZone);
        }

        /**
         * Global
         */
        if (changedZone === 'global') {
          self.message(util.format(chalk`[{bold global}] Reloading [{bold %s}] %s`, 'All Zones', changedData));
          serverDataService.hotReloadZoneQuests('all');
        }
      }
    });

  }
};
