/**
 * zoneservers.js
 * @type {createApplication}
 */
let express     = require('express');
let router      = express.Router();
let template    = require('../app/core/template-render');
let auth        = require('../app/core/auth-service');
let dataService = require('../app/core/eqemu-data-service-client.js');
let pidusage    = require('pidusage')

/* GET home page. */
router.get('/', auth.check, function (req, res, next) {
  dataService.getZoneList().then(zonelist => {

    let zone_pids = [];
    zonelist.forEach(function (zone) {
      zone_pids.push(zone.zone_os_pid);
    });

    pidusage(zone_pids, function (err, stats) {
      const content = template
        .load("zoneservers")
        .renderEjs(
          {
            "zonelist": zonelist,
            "process_stats": stats
          }
        );

      const username = req.session.username

      /**
       * Response
       */
      res.send(
        template
          .load("index")
          .var("username", username.charAt(0).toUpperCase() + username.substr(1))
          .var("content", content)
          .renderEjs()
      );

    });
  });
});

module.exports = router;