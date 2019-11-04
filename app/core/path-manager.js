const path    = require('path')
const process = require('process')
const fs      = require('fs');
const util    = require('util');
const debug   = require('debug')('eqemu-admin:path-manager');

module.exports = {
  appRoot: '',
  emuServerPath: '',

  /**
   * @param app_root
   */
  init: function (app_root) {
    this.appRoot = app_root;

    if (!fs.existsSync(app_root + '/node_modules')) {
      throw new Error(
        util.format('[%s] [%s] is not a valid application root!',
          path.basename(__filename),
          app_root
        )
      )
    }

    this.emuServerPath = this.getEmuServerPath();

    debug('appRoot [%s]', this.appRoot);
    debug('emuServerPath [%s]', this.emuServerPath);
    debug('getEqemuAdminEntrypoint [%s]', this.getEqemuAdminEntrypoint());
    debug('process.cwd [%s]', process.cwd());
  },

  /**
   * @returns {string}
   */
  getEqemuConfigName() {
    return 'eqemu_config.json';
  },

  /**
   * @param requested_path
   * @returns {*}
   */
  getEmuServerPath: function (requested_path = '') {
    if (this.isRanFromPackagedNode()) {
      return path.join(process.argv[0], '../../', requested_path);
    }

    if (this.isRanAsStandaloneNodeProject()) {
      const first_path = path.join(process.argv[1], '../../../../', requested_path);
      if (fs.existsSync(path.join(first_path, this.getEqemuConfigName()))) {
        debug('[getEmuServerPath] emu-path (1) [%s]', first_path);
        return first_path;
      }

      const second_path = path.join(process.cwd(), '../../../../', requested_path);
      if (fs.existsSync(path.join(second_path, this.getEqemuConfigName()))) {
        debug('[getEmuServerPath] emu-path (2) [%s]', second_path);
        return second_path;
      }
    }
  },

  /**
   * @returns {boolean}
   */
  isRanFromPackagedNode() {
    return __filename.indexOf('/snapshot/') > -1;
  },

  /**
   * @returns {boolean}
   */
  isRanAsStandaloneNodeProject() {
    return process.argv[1].indexOf('bin/admin') > -1;
  },

  /**
   * @returns {string}
   */
  getEqemuAdminEntrypoint() {
    if (this.isRanFromPackagedNode()) {
      return process.argv[0];
    }

    if (this.isRanAsStandaloneNodeProject()) {
      return process.argv[1];
    }
  }
};
