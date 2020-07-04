/**
 * server.js
 * @type {createApplication}
 */
const express              = require('express');
const router               = express.Router();
const serverProcessManager = require('../../core/server-process-manager');
const config               = require('../../core/eqemu-config-service');
const os                   = require('os');
const si                   = require('systeminformation');
let database               = use('/app/core/database');
let dataService            = use('/app/core/eqemu-data-service-client.js');


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

router.post('/restart/cancel', function (req, res, next) {
  serverProcessManager.cancelRestart(req.body);
  res.send({ 'data': 'Server restart cancelled' });
});

router.post('/restart', function (req, res, next) {
  serverProcessManager.restartServer(req.body);
  res.send({ 'data': 'Server restart starting' });
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

router.get('/meta', async function (req, res, next) {
  const ruleValues       = use('/app/repositories/ruleValuesRepository')
  const currentExpansion = (await ruleValues.getCurrentExpansion());
  const playersOnline    = (await dataService.getClientList());

  const eqemu_config     = config.getServerConfig();
  let meta               = {};
  meta.long_name         = eqemu_config.server.world.longname;
  meta.short_name        = eqemu_config.server.world.shortname;
  meta.stats             = {};
  meta.stats.accounts    = await database.tableRowCount(database.connection, 'account');
  meta.stats.characters  = await database.tableRowCount(database.connection, 'character_data');
  meta.stats.guilds      = await database.tableRowCount(database.connection, 'guilds');
  meta.stats.items       = await database.tableRowCount(database.contentConnection, 'items');
  meta.stats.npcs        = await database.tableRowCount(database.contentConnection, 'npc_types');
  meta.zone_count        = (await dataService.getZoneList()).length;
  meta.players_online    = (playersOnline) ? playersOnline.length : 0;
  meta.current_expansion = (currentExpansion) ? currentExpansion : 0;
  meta.process_counts    = await serverProcessManager.getProcessCounts();
  meta.uptime            = await dataService.getWorldUptime();

  res.json(meta);
});

router.get('/schema', async function (req, res, next) {
  res.json((await dataService.getDatabaseSchema()));
});

module.exports = router;
