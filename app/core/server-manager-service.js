/**
 * server-manager-service.js
 */
const execSync = require('child_process').execSync;
const { exec } = require('child_process');

/**
 * @type {{serverStop: (function(): *)}}
 */
module.exports = {

  /**
   * @returns {Buffer | string}
   */
  serverStop: function () {
    return execSync("cd ../ && ./server_stop.sh");
  },

  /**
   * @returns {Promise<*>}
   */
  serverStart: async function () {
    return await exec('cd ../ && ./server_start.sh');
  },

  /**
   * @returns {Promise<*>}
   */
  serverRestart: async function () {
    return await exec('cd ../ && ./server_stop.sh && ./server_start.sh');
  },
};