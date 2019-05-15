const express            = require('express');
const router             = express.Router();
const eqemuConfigService = require('../../core/eqemu-config-service')

router.get('/config', function (req, res, next) {
  res.send(eqemuConfigService.getServerConfig());
});

router.post('/config', function (req, res, next) {
  eqemuConfigService.saveServerConfig(req.body);
  res.send({"success": "Server config was saved successfully!"});
});

router.get('/motd', async function (req, res, next) {
  res.send(
    await models['variables'].resource.findOne({
      where: {varname: "MOTD"}
    })
  );
});

router.post('/motd', async function (req, res, next) {
  models['variables']
    .resource
    .update(
      {value: req.body.motd},
      {where: {varname: "MOTD"}}
    )
    .then(function () {
      res.json({success: "Message of the day saved!"});
    })
    .catch(function (err) {
      res.json({error: "Unknown error posting to the backend " + err})
    });
});

module.exports = router;
