const express            = require('express');
const router             = express.Router();
const eqemuConfigService = require('../../core/eqemu-config-service')

router.get('/config', function (req, res, next) {
  res.send(eqemuConfigService.getServerConfig());
});


module.exports = router;
