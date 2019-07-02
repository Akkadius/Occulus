const path    = require('path')
const process = require('process')
const fs      = require('fs');
const util    = require('util');

module.exports = {
  appRoot : '',
  cliRoot : '',
  emuServerPath : '',

  /**
   * @param app_root
   */
  init : function (app_root) {
    this.appRoot = app_root;

    if (!fs.existsSync(app_root + '/node_modules')) {
      throw new Error(
        util.format('[%s] [%s] is not a valid application root!',
          path.basename(__filename),
          app_root
        )
      )
    }

    this.cliRoot       = path.join(this.appRoot, '/app/commands/');
    this.emuServerPath = path.join(process.cwd(), '/../');

    console.debug('appRoot [%s]', this.appRoot);
    console.debug('cliRoot [%s]', this.cliRoot);
    console.debug('emuServerPath [%s]', this.emuServerPath);
  },

  /**
   * @param requested_path
   * @returns {*}
   */
  getEmuServerPath : function (requested_path = '') {
    return this.emuServerPath + requested_path;
  },

  /**
   * @param requested_path
   * @returns {*}
   */
  getCliRootPath : function (requested_path = '') {
    return this.cliRoot + requested_path;
  },

  /**
   * @param requested_path
   * @returns {*}
   */
  getAppRootPath : function (requested_path = '') {
    return this.appRoot + requested_path;
  },

  /**
   * @param requested_path
   * @returns {*}
   */
  checkPath : function (requested_path) {
    if (!fs.existsSync(requested_path)) {
      throw new Error(
        util.format('[%s] \'%s\' does not exist!',
          path.basename(__filename),
          requested_path
        )
      )
    }

    return requested_path;
  },
};
