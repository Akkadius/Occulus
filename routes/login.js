var express  = require('express');
var router   = express.Router();
var template = require('../app/core/template-render');

/* GET home page. */
router.get('/', function (req, res, next) {

  /**
   * Load login page
   */
  const login = template
    .load("login")
    .render();

  /**
   * Response
   */
  res.send(
    login
  );
});

module.exports = router;
