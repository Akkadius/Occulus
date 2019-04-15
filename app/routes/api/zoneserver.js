/**
 * zoneserver.js
 * @type {createApplication}
 */
let express     = require('express');
let router      = express.Router();
let dataService = require('../../core/eqemu-data-service-client.js');

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