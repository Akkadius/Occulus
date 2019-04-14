/**
 * @type {{check: module.exports.check}}
 */
module.exports = {
  serverLauncher: function (options) {
    require('../core/server-process-manager').start(options);
  },
  stopServer: function (options) {
    require('../core/server-process-manager').stopServer(options);
  },
};