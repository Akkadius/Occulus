/**
 * netstats.js
 * @type {createApplication}
 */
let express  = require('express');
let router   = express.Router();
let template = require('../../app/core/template-render');
let auth     = require('../../app/core/auth-service');

/* GET home page. */
router.get('/', auth.check, function (req, res, next) {
  const content  = template.load("netstats").render();
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

module.exports = router;