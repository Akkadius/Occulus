let express            = require('express');
let router             = express.Router();
let dataService        = require('../../../core/eqemu-data-service-client.js');
let eqemuConfigService = require('../../../core/eqemu-config-service')
let database           = require('../../../core/database')

/* GET home page. */
router.get('/', async function (req, res, next) {

  const eqemu_config = eqemuConfigService.getServerConfig();
  let stats          = {};
  stats.long_name    = eqemu_config.server.world.longname;
  stats.shortname    = eqemu_config.server.world.shortname;
  stats.zone_count   = 0;
  stats.accounts     = await database.tableRowCount(database.connection, 'account');
  stats.characters   = await database.tableRowCount(database.connection, 'character_data');
  stats.guilds       = await database.tableRowCount(database.connection, 'guilds');
  stats.items        = await database.tableRowCount(database.contentConnection, 'items');
  stats.npcs         = await database.tableRowCount(database.contentConnection, 'npc_types');
  stats.uptime       = await dataService.getWorldUptime();

  res.send(stats);
});

module.exports = router;
