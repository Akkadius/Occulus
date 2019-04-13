/**
 * @type {{check: module.exports.check}}
 */
module.exports = {
  serverLauncher: function (options) {
    require('../core/server-launcher-service').start(options);
  },
  stopServer: function (options) {
    require('../core/server-launcher-service').stopServer(options);
  },
};