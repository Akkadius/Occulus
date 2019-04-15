/**
 * eqemu-config-service.js
 * @type {any}
 */
let pathManager = require('../../app/core/path-manager')
let fs          = require('fs');

/**
 * @type {{getServerConfig(): *, init: (function(): exports), serverConfig: {}}}
 */
module.exports  = {
  serverConfig: {},

  /**
   * Initialize config
   * @returns {exports}
   */
  init: function () {
    const config      = pathManager.getEmuServerPath('eqemu_config.json');
    this.serverConfig = JSON.parse(fs.readFileSync(config, 'utf8'));

    return this;
  },

  /**
   * @returns {module.exports.serverConfig|{}}
   */
  getServerConfig() {
    return this.serverConfig;
  },

};