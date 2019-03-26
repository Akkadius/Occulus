/**
 * server-manager-service.js
 */
const execSync = require('child_process').execSync;
const { exec } = require('child_process');

/**
 * @type {{serverStop: (function(): *)}}
 */
module.exports = {
  serverStop: function () {
    exec("cd ../ && ./server_stop.sh");
  },
  serverStart: function () {
    exec('cd ../ && ./server_start.sh');
  },
  serverRestart: function () {
    exec('cd ../ && ./server_stop.sh && ./server_start.sh');
  },
};