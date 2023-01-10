/**
 * @type {{check: module.exports.check}}
 */
module.exports = {

  /**
   * @param options
   */
  startListener: function (options) {
    require('../core/hot-reload-service').init(options);
  },

};
