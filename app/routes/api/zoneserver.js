/**
 * zoneserver.js
 * @type {createApplication}
 */
let express     = require('express');
let router      = express.Router();
let dataService = require('../../core/eqemu-data-service-client.js');
let pidusage    = require('pidusage');

router.get('/list', async function (req, res, next) {
  const zone_list = await dataService.getZoneList();

  if (zone_list) {
    let zone_pids = [];
    zone_list.forEach(function (zone) {
      zone_pids.push(zone.zone_os_pid);
    });

    pidusage(zone_pids, function (err, stats) {
      res.send({
        "zone_list": zone_list,
        "process_stats": stats
      });
    });

    return false;
  }
});

router.get('/:port/netstats', function (req, res, next) {
  const port = req.params.port;

  dataService.getZoneNetStats(port).then(response => {
    res.send(response);
  });
});

router.get('/:port/attributes', function (req, res, next) {
  const port = req.params.port;

  dataService.getZoneAttributes(port).then(response => {
    res.send(response);
  });
});

router.get('/:port/client/list/detail', function (req, res, next) {
  const port = req.params.port;

  dataService.getClientListDetail(port).then(response => {
    res.send(response);
  });
});

router.get('/:port/npc/list/detail', function (req, res, next) {
  const port = req.params.port;

  dataService.getNpcListDetail(port).then(response => {
    res.send(response);
  });
});

module.exports = router;
