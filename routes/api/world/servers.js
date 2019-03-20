/**
 * servers.js
 * @type {createApplication}
 */
let express       = require('express');
let router        = express.Router();
let telnetService = require('../../../app/core/telnet-service.js');

/* GET home page. */
router.get('/', function (req, res, next) {
  telnetService.execWorld("api get_zone_list").then(response => {
    res.send(JSON.parse(response));
  });
});

module.exports = router;