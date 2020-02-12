/**
 * @type {{check: module.exports.check}}
 */
module.exports = {

  /**
   * @param options
   */
  serverLauncher: function (options) {
    require('../core/server-process-manager').start(options);
  },

  /**
   * @param options
   */
  stopServer: function (options) {
    require('../core/server-process-manager').stopServer(options);
  },

  /**
   * @param options
   */
  restartServer: function (options) {
    require('../core/server-process-manager').restartServer(options);
  },
};
