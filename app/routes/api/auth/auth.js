const express            = require('express');
const router             = express.Router();
const authService        = require('../../../../app/core/auth-service')
const eqemuConfigService = require('../../../../app/core/eqemu-config-service')

router.post('/login', function (req, res, next) {
  const username       = req.body.username;
  const password       = req.body.password;
  const admin_password = eqemuConfigService.getAdminPanelConfig('application.admin.password');

  if (username === 'admin' && password === admin_password) {
    return res.send(
      {
        success: 'Login success',
        access_token: authService.generateToken(username)
      }
    );
  }

  res.status(401).send({ error: 'Invalid credentials!' });
});

router.post('/validate', function (req, res, next) {
  const token = req.param('token');

  console.log('token "%s"', token)
  console.log(authService.isTokenValid(token));
  res.send('Test');
});

module.exports = router;
