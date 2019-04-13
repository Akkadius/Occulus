/**
 * server-manager-service.js
 */
const {exec}                = require('child_process');
const {spawn}               = require("child_process");
const serverLauncherService = require('../../app/core/server-launcher-service');

/**
 * @type {{serverStop: (function(): *)}}
 */
module.exports = {
  serverStop: function () {
    serverLauncherService.stopServer();
  },
  serverStart: function () {
    spawn('node', ['cli.js', 'server_launcher'], {detached: true}).unref();
  },
  serverRestart: function () {
    this.serverStop();
    this.serverStart();
  },
};