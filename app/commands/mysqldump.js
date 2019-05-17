const mysqldump = require('../../app/core/mysqldump-service');

/**
 * @type {{check: module.exports.check}}
 */
module.exports = {
  dump: function () {
    mysqldump.dump();
  },
};
