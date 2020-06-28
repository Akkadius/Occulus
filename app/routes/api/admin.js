const express              = require('express');
const router               = express.Router();
const eqemuConfigService   = require('../../core/eqemu-config-service')
const database             = require('../../core/database')
const variableRepository   = require('../../repositories/variableRepository')
const ruleValuesRepository = require('../../repositories/ruleValuesRepository')
const pathManager          = use('/app/core/path-manager');
const util                 = require('util')
const path                 = require('path')
const fs                   = require('fs')
const config               = use('/app/core/eqemu-config-service')

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

router.post('/git/update/quests', async function (req, res, next) {
  const command = util.format(
    'cd %s && git pull',
    path.join(pathManager.getEmuServerPath(), 'quests')
  )

  let result

  try {
    result = require('child_process')
      .execSync(command)
      .toString();
  } catch (err) {
    result = err.toString()
  }

  res.send(result);
});

router.post('/git/update/maps', async function (req, res, next) {
  const command = util.format(
    'cd %s && git pull',
    path.join(pathManager.getEmuServerPath(), 'maps')
  )

  let result

  try {
    result = require('child_process')
      .execSync(command)
      .toString();
  } catch (err) {
    result = err.toString()
  }

  res.send(result);
});

router.post('/code/git/update', async function (req, res, next) {
  const codePath = config.getAdminPanelConfig('serverCodePath', '/home/eqemu/code/')
  const command  = util.format(
    'cd %s && git pull',
    path.join(codePath, 'build')
  )

  let result

  try {
    result = require('child_process')
      .execSync(command, { stdio: [this.stdin, this.stdout, this.stderr] })
      .toString();
  } catch (err) {
    result = err.toString()
  }

  res.send(result);
});

const TEMP_BUILD_OUTPUT_PATH = '/tmp/build-output';

router.post('/code/build', async function (req, res, next) {
  const codePath   = config.getAdminPanelConfig('serverCodePath', '/home/eqemu/code/')
  const buildCores = parseInt(require('os').cpus().length / 2).toString();
  const command    = util.format(
    'cd %s && make -j%s > %s &',
    path.join(codePath, 'build'),
    buildCores,
    TEMP_BUILD_OUTPUT_PATH
  );

  require('child_process')
    .exec(command, function (err, stdout) {
    });

  res.json({ message: 'Build job submitted', buildCores: buildCores });
});

router.post('/code/build/cancel', async function (req, res, next) {
  require('child_process')
    .exec('pkill -9 make', function (err, stdout) {
    });

  res.json({ message: 'Build job killed', buildCores: buildCores });
});

router.get('/code/build/status', async function (req, res, next) {
  res.json(
    { log: fs.readFileSync(TEMP_BUILD_OUTPUT_PATH, 'utf8') }
  );
});

router.get('/code/git/branch', async function (req, res, next) {
  const codePath = config.getAdminPanelConfig('serverCodePath', '/home/eqemu/code/')
  const command  = util.format(
    'cd %s && git rev-parse --abbrev-ref HEAD',
    codePath
  )

  let result

  try {
    result = require('child_process')
      .execSync(command)
      .toString();
  } catch (err) {
    result = err.toString()
  }

  res.send(result);
});

router.post('/code/git/branch/:branch', async function (req, res, next) {
  const codePath = config.getAdminPanelConfig('serverCodePath', '/home/eqemu/code/')
  const command  = util.format(
    'cd %s && git fetch origin && git checkout %s && git pull',
    codePath,
    req.params.branch
  )

  let result

  try {
    result = require('child_process')
      .execSync(command)
      .toString();
  } catch (err) {
    result = err.toString()
  }

  res.send(result);
});

router.get('/code/git/branches', async function (req, res, next) {
  const codePath = config.getAdminPanelConfig('serverCodePath', '/home/eqemu/code/')
  const command  = util.format(
    'cd %s && git fetch origin && git branch -a',
    codePath
  );

  let result;

  try {
    result = require('child_process')
      .execSync(command)
      .toString();
  } catch (err) {
    result = err.toString()
  }

  result = result.split('\n').filter(function (line) {
    return line.indexOf('->') === -1;
  }).join('\n');

  result = result
    .trim()
    .replace(/^ +/gm, '')
    .replace(/remotes\/origin\//g, '')
    .replace(/\* /g, '')
    .split('\n');

  res.json({ branches: result });
});

module.exports = router;
