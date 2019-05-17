/**
 * eqemu-config-service.js
 * @type {any}
 */
let pathManager = require('../../app/core/path-manager')
let fs          = require('fs');

/**
 * @type {{getServerConfig(): *, init: (function(): exports), serverConfig: {}}}
 */
module.exports = {
  serverConfig: {},

  /**
   * Initialize config
   * @returns {exports}
   */
  init: function () {
    if (Object.keys(this.serverConfig).length) {
      return this;
    }

    const config      = pathManager.getEmuServerPath('eqemu_config.json');
    this.serverConfig = JSON.parse(fs.readFileSync(config, 'utf8'));

    return this;
  },

  reload: function () {
    const config      = pathManager.getEmuServerPath('eqemu_config.json');
    this.serverConfig = JSON.parse(fs.readFileSync(config, 'utf8'));
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
    return (this.serverConfig.server.database.db ? this.serverConfig.server.database.db : "")
  },

  /**
   * @returns {null}
   */
  getDatabaseHost() {
    return (this.serverConfig.server.database.host ? this.serverConfig.server.database.host : "")
  },

  /**
   * @returns {null}
   */
  getDatabaseUsername() {
    return (this.serverConfig.server.database.username ? this.serverConfig.server.database.username : "")
  },

  /**
   * @returns {null}
   */
  getDatabasePassword() {
    return (this.serverConfig.server.database.password ? this.serverConfig.server.database.password : "")
  },

  /**
   * @returns {null}
   */
  getDatabasePort() {
    return (this.serverConfig.server.database.port ? this.serverConfig.server.database.port : "")
  },

  /**
   * @returns {module.exports.serverConfig|{}}
   */
  saveServerConfig(data) {
    const config = pathManager.getEmuServerPath('eqemu_config.json');

    fs.writeFileSync(config, JSON.stringify(data, null, 2), 'utf8');
    this.serverConfig = data;
  },

};
