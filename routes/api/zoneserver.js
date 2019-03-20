/**
 * zoneserver.js
 * @type {createApplication}
 */
let express     = require('express');
let router      = express.Router();
let dataService = require('../../app/core/eqemu-data-service-client.js');

/* GET home page. */
router.get('/:port/netstats', function (req, res, next) {
  const port = req.params.port;

  dataService.getZoneNetStats(port).then(response => {
    res.send(response);
  });
});

module.exports = router;