let express     = require('express');
let router      = express.Router();
let dataService = require('../../../app/core/eqemu-data-service-client.js');


/* GET home page. */
router.get('/', function (req, res, next) {

  let dashboard_stats = {};

  dashboard_stats.long_name  = eqemu_config.server.world.longname;
  dashboard_stats.shortname  = eqemu_config.server.world.shortname;
  dashboard_stats.zone_count = 0;

  /**
   * Zone count
   *
   * @type {any}
   */
  const process_list = require('ps-list');

  process_list().then(data => {
    var processes_length = data.length;
    for (var i = 0; i < processes_length; i++) {
      if (/zone/.test(data[i].cmd)) {
        dashboard_stats.zone_count++;
      }
    }
  });

  models['account'].resource.count().then(c => {
    dashboard_stats.accounts = c;
  }).then(() => models['character_data'].resource.count().then(c => {
    dashboard_stats.characters = c;
  })).then(() => models['items'].resource.count().then(c => {
    dashboard_stats.items = c;
  })).then(() => models['guilds'].resource.count().then(c => {
    dashboard_stats.guilds = c;
  })).then(() => dataService.getWorldUptime().then(c => {
    dashboard_stats.uptime = c;
  })).then(() => res.send(dashboard_stats));

});

module.exports = router;