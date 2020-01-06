/**
 * server.js
 * @type {createApplication}
 */
const express              = require('express');
const router               = express.Router();
const serverProcessManager = require('../../core/server-process-manager')
const config               = require('../../core/eqemu-config-service')
const os                   = require('os')
const si                   = require('systeminformation');

router.get('/hello', function (req, res, next) {
  res.send({ 'data': 'hello' });
});

router.get('/websocket-authorization', async function (req, res, next) {
  const websocketAuth  = require('../../core/websocket-auth')
  const authorizedUser = await websocketAuth.checkEqemuWebsocketAuthorization()
  res.json(authorizedUser);
});

router.get('/sysinfo', async function (req, res, next) {
  res.send(
    {
      'hostname': os.hostname(),
      'uptime': os.uptime(),
      'cpu': {
        info: await si.cpu(),
        speed: await si.cpuCurrentspeed(),
        load: await si.currentLoad()
      },
      'mem': await si.mem(),
      'system': await si.system(),
      'os': await si.osInfo(),
      'disk': {
        'io': await si.disksIO(),
        'fs': {
          'size': await si.fsSize(),
          'stats': await si.fsStats()
        }
      },
      'network': {
        'interfaces': await si.networkInterfaces(),
        'stats': await si.networkStats()
      }
    }
  );
});

router.get('/stop', function (req, res, next) {
  serverProcessManager.stopServer();
  res.send({ 'data': 'Server has been stopped successfully' });
});

router.get('/start', function (req, res, next) {
  serverProcessManager.startServerLauncher();
  res.send({ 'data': 'Server has been started successfully!' });
});

router.get('/restart', function (req, res, next) {
  serverProcessManager.restartServer();
  res.send({ 'data': 'Server has been restarted successfully!' });
});

router.get('/launcher/config', function (req, res, next) {
  res.send({ 'data': config.getAdminPanelConfig('launcher') });
});

router.post('/launcher/config', function (req, res, next) {
  config
    .setAdminPanelConfig('launcher', req.body)
    .saveServerConfig()

  res.send({ 'data': 'Launcher config updated!' });
});

router.get('/process_counts', async function (req, res, next) {
  const process_counts = await serverProcessManager.getProcessCounts();
  res.send(process_counts);
});

router.get('/log_categories', async function (req, res, next) {
  res.send(
    await models['logsys_categories'].resource.findAll({ order: [['log_category_description', 'ASC']] })
  );
});

module.exports = router;
