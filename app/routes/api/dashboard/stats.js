let express     = require('express');
let router      = express.Router();
let dataService = require('../../../core/eqemu-data-service-client.js');


/* GET home page. */
router.get('/', async function (req, res, next) {

  let dashboard_stats = {};

  dashboard_stats.long_name  = eqemu_config.server.world.longname;
  dashboard_stats.shortname  = eqemu_config.server.world.shortname;
  dashboard_stats.zone_count = 0;

  dashboard_stats.accounts   = await models['account'].resource.count();
  dashboard_stats.characters = await models['character_data'].resource.count();
  dashboard_stats.items      = await models['items'].resource.count();
  dashboard_stats.guilds     = await models['guilds'].resource.count();
  dashboard_stats.npcs       = await models['npc_types'].resource.count();
  dashboard_stats.uptime     = await dataService.getWorldUptime();

  res.send(dashboard_stats);

});

module.exports = router;