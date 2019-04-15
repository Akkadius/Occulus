/**
 * netstats.js
 * @type {createApplication}
 */
let express  = require('express');
let router   = express.Router();
let template = require('../../core/template-render');
let auth     = require('../../core/auth-service');

/* GET home page. */
router.get('/:port/netstats', auth.check, function (req, res, next) {
  const content  = template.load("netstats").renderEjs({port: req.params.port});
  const username = req.session.username;

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

module.exports = router;