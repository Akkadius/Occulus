var express = require('express');
var router  = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {

  dashboard_stats           = {};

  models['account'].resource.count().then(c => {
    dashboard_stats.accounts = c;
  }).then(() => models['character_data'].resource.count().then(c => {
    dashboard_stats.characters = c;
  })).then(() => models['items'].resource.count().then(c => {
    dashboard_stats.items = c;
  })).then(() => res.send(dashboard_stats));

});

module.exports = router;
