var express  = require('express');
var router   = express.Router();
var template = require('../app/core/template-render');
var auth     = require('../app/core/auth-service');

/* GET home page. */
router.get('/', auth.check, function (req, res, next) {
  const dashboard = template.load("dashboard").render();
  const username = req.session.username

  /**
   * Response
   */
  res.send(
    template
      .load("index")
      .var("username", username.charAt(0).toUpperCase() + username.substr(1))
      .var("content", dashboard)
      .render()
  );
});

module.exports = router;
