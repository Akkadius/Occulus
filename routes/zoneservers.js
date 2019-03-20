/**
 * zoneservers.js
 * @type {createApplication}
 */
var express     = require('express');
var router      = express.Router();
var template    = require('../app/core/template-render');
var auth        = require('../app/core/auth-service');
let dataService = require('../app/core/eqemu-data-service-client.js');

/* GET home page. */
router.get('/', auth.check, function (req, res, next) {
  dataService.getZoneList().then(zonelist => {
    const content  = template.load("zoneservers").renderEjs({"zonelist": zonelist});
    const navbar   = template.load("navbar").render();
    const username = req.session.username

    /**
     * Response
     */
    res.send(
      template
        .load("index")
        .var("username", username.charAt(0).toUpperCase() + username.substr(1))
        .var("navbar", navbar)
        .var("content", content)
        .render()
    );
  });
});

module.exports = router;