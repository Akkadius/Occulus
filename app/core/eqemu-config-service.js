/**
 * eqemu-config-service.js
 * @type {any}
 */
let pathManager = require('../../app/core/path-manager')
let fs          = require('fs');
const dot       = require('dot-object');
const debug     = require('debug')('eqemu-admin:eqemu-config-service');
const path      = require('path')

/**
 * @type {{getServerConfig(): *, init: (function(): exports), serverConfig: {}}}
 */
module.exports = {
  serverConfig : {},
  serverConfigPath : '',

  /**
   * Initialize config
   * @returns {exports}
   */
  init() {
    if (Object.keys(this.serverConfig).length) {
      return this;
    }

    this.setServerConfigPath(
      path.join(pathManager.getEmuServerPath(), 'eqemu_config.json')
    );

    debug('set config path to [%s]', this.getServerConfigPath());

    this.serverConfig = JSON.parse(fs.readFileSync(this.getServerConfigPath(), 'utf8'));

    console.log('Loaded [%s]', this.getServerConfigPath()); 

    return this;
  },

  setServerConfigPath(path) {
    this.serverConfigPath = path;
  },

  getServerConfigPath() {
    return this.serverConfigPath;
  },

  reload() {
    this.serverConfig = JSON.parse(fs.readFileSync(this.getServerConfigPath(), 'utf8'));
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
    return (this.serverConfig.server.world.longname ? this.serverConfig.server.world.longname : null)
  },

  /**
   * @returns {null}
   */
  getDatabaseName() {
    return (this.serverConfig.server.database.db ? this.serverConfig.server.database.db : '')
  },

  /**
   * @returns {null}
   */
  getDatabaseHost() {
    return (this.serverConfig.server.database.host ? this.serverConfig.server.database.host : '')
  },

  /**
   * @returns {null}
   */
  getDatabaseUsername() {
    return (this.serverConfig.server.database.username ? this.serverConfig.server.database.username : '')
  },

  /**
   * @returns {null}
   */
  getDatabasePassword() {
    return (this.serverConfig.server.database.password ? this.serverConfig.server.database.password : '')
  },

  /**
   * @returns {null}
   */
  getDatabasePort() {
    return (this.serverConfig.server.database.port ? this.serverConfig.server.database.port : '')
  },

  /**
   * @returns {module.exports.serverConfig|{}}
   */
  saveServerConfig(data = undefined) {
    if (!data) {
      data = this.getServerConfig()
    }

    fs.writeFileSync(
      this.getServerConfigPath(),
      JSON.stringify(data, null, 1),
      'utf8'
    );

    this.serverConfig = data;
  },

  /**
   * Sets config under named block
   *
   * @param accessor
   * @param value
   */
  setAdminPanelConfig(accessor, value) {
    dot.str('web-admin.' + accessor, value, this.getServerConfig());
  },

  /**
   * Returns admin panel config using dot notation
   *
   * Example: 'application.key'
   *
   * @returns {null}
   */
  getAdminPanelConfig(accessor) {
    return dot.pick('web-admin.' + accessor, this.getServerConfig())
  },
};
