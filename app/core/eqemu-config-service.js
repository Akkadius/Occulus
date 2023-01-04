/**
 * eqemu-config-service.js
 * @type {any}
 */
let pathManager = require('../../app/core/path-manager');
let fs          = require('fs');
const dot       = require('dot-object');
const debug     = require('debug')('eqemu-admin:eqemu-config-service');
const path      = require('path');
const watch     = require('node-watch');
const chalk     = require('chalk');
const util      = require('util');

/**
 * @type {{getServerConfig(): *, init: (function(): exports), serverConfig: {}}}
 */
module.exports = {
  serverConfig: {},
  serverConfigPath: '',

  /**
   * Initialize config
   * @returns {exports}
   */
  init(skipWatch = false) {
    if (Object.keys(this.serverConfig).length) {
      return this;
    }

    debug('attempting config path to [%s]', path.join(pathManager.getEmuServerPath(), 'eqemu_config.json'));

    this.setServerConfigPath(
      path.join(pathManager.getEmuServerPath(), 'eqemu_config.json')
    );

    debug('set config path to [%s]', this.getServerConfigPath());

    this.serverConfig = JSON.parse(fs.readFileSync(this.getServerConfigPath(), 'utf8'));

    if (!skipWatch) {
      watch(this.getServerConfigPath(), (evt, file) => {
        console.log(chalk`{green [{bold EQEmuConfig}] File change detected, reloading... }`);
        this.serverConfig = JSON.parse(fs.readFileSync(this.getServerConfigPath(), 'utf8'));
      });
    }

    // init defaults
    if (this.getAdminPanelConfig("discord.crash_log_webhook", "") === '') {
      this.setAdminPanelConfig("discord.crash_log_webhook", "")
    }

    debug('Loaded [%s]', this.getServerConfigPath());

    return this;
  },

  /**
   * @param path
   * @returns {module.exports}
   */
  setServerConfigPath(path) {
    this.serverConfigPath = path;

    return this;
  },

  /**
   * @returns {string}
   */
  getServerConfigPath() {
    return this.serverConfigPath;
  },

  /**
   * @returns {module.exports}
   */
  reload() {
    this.serverConfig = JSON.parse(fs.readFileSync(this.getServerConfigPath(), 'utf8'));

    return this;
  },

  /**
   * @returns {module.exports.serverConfig|{}}
   */
  getFreshServerConfig() {
    this.serverConfig = JSON.parse(fs.readFileSync(this.getServerConfigPath(), 'utf8'));

    debug('[getFreshServerConfig] fetching');

    return this.serverConfig;
  },

  /**
   * @returns {module.exports.serverConfig|{}}
   */
  getServerConfig() {
    return this.serverConfig;
  },

  /**
   * @returns {null}
   */
  getServerLongName() {
    return (this.serverConfig.server.world.longname ? this.serverConfig.server.world.longname : null);
  },

  /**
   * @returns {null}
   */
  getDatabaseName() {
    return (this.serverConfig.server.database.db ? this.serverConfig.server.database.db : '');
  },

  /**
   * @returns {null}
   */
  getDatabaseHost() {
    return (this.serverConfig.server.database.host ? this.serverConfig.server.database.host : '');
  },

  /**
   * @returns {null}
   */
  getDatabaseUsername() {
    return (this.serverConfig.server.database.username ? this.serverConfig.server.database.username : '');
  },

  /**
   * @returns {null}
   */
  getDatabasePassword() {
    return (this.serverConfig.server.database.password ? this.serverConfig.server.database.password : '');
  },

  /**
   * @returns {null}
   */
  getDatabasePort() {
    return (this.serverConfig.server.database.port ? this.serverConfig.server.database.port : '');
  },

  /**
   * @param data
   * @returns {module.exports}
   */
  saveServerConfig(data = undefined) {
    if (!data) {
      this.reload()
      data = this.getServerConfig();
    }

    debug('[saveServerConfig] writing config');

    if (typeof data !== "undefined" && data.length === 0) {
      this.reload()
      return
    }

    fs.writeFileSync(
      this.getServerConfigPath(),
      JSON.stringify(data, null, 1),
      'utf8'
    );

    this.serverConfig = data;

    return this;
  },

  /**
   * Sets config under named block
   *
   * @param accessor
   * @param value
   * @returns {module.exports}
   */
  setAdminPanelConfig(accessor, value) {
    dot.override = true;

    dot.str('web-admin.' + accessor, value, this.getServerConfig());

    this.saveServerConfig(this.serverConfig);

    return this;
  },

  /**
   * Returns admin panel config using dot notation
   * Example: 'application.key'
   * @param accessor
   * @returns {*}
   */
  getAdminPanelConfig(accessor, defaultValue = '') {

    const accessorKey = 'web-admin.' + accessor;
    const configVar   = dot.pick(accessorKey, this.getServerConfig());

    debug('[getAdminPanelConfig] config [%s] = [%s] default [%s]', accessor, configVar, defaultValue);

    if (typeof configVar === 'undefined' && defaultValue !== '') {
      debug('[getAdminPanelConfig] writing default value for [%s] default [%s]', accessor, defaultValue);

      this.setAdminPanelConfig(accessor, defaultValue);
    }

    return (configVar ? configVar : defaultValue);
  }
};
