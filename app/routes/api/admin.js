const express              = require('express');
const router               = express.Router();
const eqemuConfigService   = require('../../core/eqemu-config-service')
const database             = require('../../core/database')
const variableRepository   = require('../../repositories/variableRepository')
const ruleValuesRepository = require('../../repositories/ruleValuesRepository')

router.get('/config', function (req, res, next) {
  res.send(eqemuConfigService.getServerConfig());
});

router.post('/config', function (req, res, next) {
  eqemuConfigService.saveServerConfig(req.body);
  res.send({ 'success': 'Server config was saved successfully!' });
});

router.get('/motd', async function (req, res, next) {
  res.send(await variableRepository.getMotd());
});

router.post('/motd', async function (req, res, next) {
  variableRepository.updateMotd(req.body.motd)
    .then(function () {
      res.json({ success: 'Message of the day saved!' });
    })
    .catch(function (err) {
      res.json({ error: 'Unknown error posting to the backend ' + err })
    });
});

router.get('/rule_values', async function (req, res, next) {
  res.send(
    await ruleValuesRepository.getAllRuleValues()
  );
});

router.post('/rule_values', async function (req, res, next) {
  const rule = req.body;

  ruleValuesRepository.updateRuleValue(rule.ruleset_id, rule.rule_name, rule.rule_value)
    .then(function () {
      res.json({ success: rule.rule_name + ' set to (' + rule.rule_value + ')' });
    })
    .catch(function (err) {
      res.json({ error: 'Unknown error posting to the backend ' + err })
    });
});

module.exports = router;
