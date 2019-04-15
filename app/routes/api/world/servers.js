/**
 * servers.js
 * @type {createApplication}
 */
let express     = require('express');
let router      = express.Router();
let dataService = require('../../../core/eqemu-data-service-client.js');

/* GET home page. */
router.get('/', function (req, res, next) {
  dataService.getZoneList().then(response => {
    res.send(response);
  });
});

module.exports = router;