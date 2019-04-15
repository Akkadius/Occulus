/**
 * server.js
 * @type {createApplication}
 */
let express                = require('express');
let router                 = express.Router();
const serverProcessManager = require('../../core/server-process-manager')

router.get('/hello', function (req, res, next) {
  res.send({"data": "hello"});
});

router.get('/stop', function (req, res, next) {
  serverProcessManager.stopServer();
  res.send({"data": "Server has been stopped successfully"});
});

router.get('/start', function (req, res, next) {
  serverProcessManager.startServerLauncher();
  res.send({"data": "Server has been started successfully!"});
});

router.get('/restart', function (req, res, next) {
  serverProcessManager.restartServer();
  res.send({"data": "Server has been restarted successfully!"});
});

module.exports = router;