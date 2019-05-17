const pathManager        = require('../../app/core/path-manager');
const eqemuConfigService = require('../../app/core/eqemu-config-service')
const util               = require('util')
const slugify            = require('slugify')
const os                 = require('os')
const path               = require('path')

/**
 * @type {{check: module.exports.check}}
 */
module.exports = {
  specificTables: "",
  backupFullSqlFilePath: "",
  addedParameters: "",

  /**
   * @returns {string}
   */
  dump: function () {
    eqemuConfigService.init()

    if (this.backupFullSqlFilePath === "") {
      const serverLongName       = eqemuConfigService.getServerLongName()
      const now                  = new Date();
      const dateFileString       = now.getFullYear() + "-" + now.getMonth() + "-" + now.getDate();
      const fileName             = slugify(
        util.format('db-(%s)-%s-%s.sql', eqemuConfigService.getDatabaseName(), dateFileString, serverLongName.toLowerCase()),
        {remove: /[*+~()'"!:@]/g}
      )
      this.backupFullSqlFilePath = path.join(os.tmpdir(), fileName)
    }

    const command = util.format(
      'mysqldump -u%s --host %s %s --max_allowed_packet=512M --password="%s" %s %s > %s',
      eqemuConfigService.getDatabaseUsername(),
      eqemuConfigService.getDatabaseHost(),
      this.addedParameters,
      eqemuConfigService.getDatabasePassword(),
      eqemuConfigService.getDatabaseName(),
      this.specificTables,
      this.backupFullSqlFilePath,
    );

    require('child_process').execSync(command);

    return this.backupFullSqlFilePath;
  },

  getBackupFullSqlFilePath: function () {
    return this.backupFullSqlFilePath;
  }
};
