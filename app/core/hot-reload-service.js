/**
 * hot-reload-service.js
 * @type {{exec: module.exports.exec}}
 */
const serverDataService  = require('./eqemu-data-service-client')
const pathManager        = require('./path-manager')
const debug              = require('debug')('eqemu-admin:hot-reload-service')
const watch              = require('node-watch');
const database           = require('./database')
const eqemuConfigService = require('./eqemu-config-service')

module.exports = {
  zones: null,

  loadZones: async function () {
    this.zones = await database.connection.query('SELECT * FROM zone', { type: 'SELECT' });

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

  /**
   * @return {boolean}
   */
  startListener: async function (options) {

    await eqemuConfigService.init();
    await database.init();
    await this.loadZones();

    console.log('[hot-reload-service] Starting hot-reload service listener...')

    debug('Starting listener for [%s]', pathManager.getEmuQuestsPath())

    let self = this;

    /**
     * Lua Modules
     */
    watch(pathManager.getEmuLuaModulesPath(), { recursive: true }, function (evt, file) {
      console.log(
        '[hot-reload-service] [lua_modules] [%s] changed type [%s]',
        file,
        evt
      );

      console.log('[hot-reload-service] [global] Reloading all zones globally');
      serverDataService.hotReloadZoneQuests("all");
    });

    /**
     * Plugins
     */
    watch(pathManager.getEmuPluginsPath(), { recursive: true }, function (evt, file) {
      console.log(
        '[hot-reload-service] [plugins] [%s] changed type [%s]',
        file,
        evt
      );

      console.log('[hot-reload-service] [global] Reloading all zones globally');
      serverDataService.hotReloadZoneQuests("all");
    });

    /**
     * Quests
     */
    watch(pathManager.getEmuQuestsPath(), { recursive: true }, function (evt, file) {
      const changedFile = file.replace(pathManager.getEmuQuestsPath() + '/', '');
      const changedZone = changedFile.split('/')[0].trim()

      console.log(
        '[hot-reload-service] [%s] changed type [%s] zone [%s] zone_exists [%s]',
        changedFile,
        evt,
        changedZone,
        self.doesZoneExist(changedZone)
      );

      /**
       * Zone
       */
      if (self.doesZoneExist(changedZone)) {
        console.log('[hot-reload-service] [zone] Reloading zone [%s]', changedZone);
        serverDataService.hotReloadZoneQuests(changedZone);
      }

      /**
       * Global
       */
      if (changedZone === "global") {
        console.log('[hot-reload-service] [global] Reloading all zones globally');
        serverDataService.hotReloadZoneQuests("all");
      }
    });

  }
};
