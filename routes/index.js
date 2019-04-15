/**
 * index.js
 * @type {createApplication}
 */
var express                = require('express');
var router                 = express.Router();
var template               = require('../app/core/template-render');
var auth                   = require('../app/core/auth-service');
const serverProcessManager = require('../app/core/server-process-manager');

/* GET home page. */
router.get('/', auth.check, async function (req, res, next) {
  console.log(await serverProcessManager.getProcessCounts());

  const process_counts = await serverProcessManager.getProcessCounts();
  const dashboard      = template.load("dashboard").renderEjs(
    { "process_counts" : process_counts }
  );

  const username = req.session.username;

  /**
   * Response
   */
  res.send(
    template
      .load("index")
      .var("username", username.charAt(0).toUpperCase() + username.substr(1))
      .var("content", dashboard)
      .renderEjs()
  );
});

module.exports = router;