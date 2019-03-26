/**
 * server.js
 * @type {createApplication}
 */
let express                = require('express');
let router                 = express.Router();
const serverManagerService = require('../../app/core/server-manager-service')

router.get('/hello', function (req, res, next) {
  res.send({"data": "hello"});
});

router.get('/stop', function (req, res, next) {
  serverManagerService.serverStop();
  res.send({"data": "Server has been stopped successfully"});
});

router.get('/start', function (req, res, next) {
  serverManagerService.serverStart();
  res.send({"data": "Server has been started successfully!"});
});

router.get('/restart', function (req, res, next) {
  serverManagerService.serverRestart();
  res.send({"data": "Server has been restarted successfully!"});
});

module.exports = router;