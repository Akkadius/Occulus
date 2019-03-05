var express  = require('express');
var router   = express.Router();
var template = require('../app/core/template-render');

/* GET home page. */
router.get('/', function (req, res, next) {
  const dashboard = template.load("dashboard").render();

  /**
   * Response
   */
  res.send(
    template
      .load("index")
      .var("content", dashboard)
      .render()
  );
});

module.exports = router;
