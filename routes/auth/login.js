/**
 * login.js
 * @type {createApplication}
 */
var express  = require('express');
var router   = express.Router();
var template = require('../../app/core/template-render');

/**
 * GET
 */
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
  res.send(login);
});

/**
 * POST
 */
router.post('/', function (req, res, next) {
  const username = req.body.username;
  const password = req.body.password;

  if (username === "admin" && password === "admin") {
    req.session.loggedIn = true;
    req.session.username = username;
    res.send({success: "Login success"});
  }

  /**
   * Response
   */
  res.status(422).send({error: "Login incorrect!"});
});

module.exports = router;