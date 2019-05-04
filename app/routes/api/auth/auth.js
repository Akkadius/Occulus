const express     = require('express');
const router      = express.Router();
const authService = require('../../../../app/core/auth-service')

router.get('/logout', function (req, res, next) {
  res.send({success: "Logged out"});
});

router.post('/login', function (req, res, next) {
  const username = req.body.username;
  const password = req.body.password;

  if (username === "admin" && password === "admin") {
    return res.send(
      {
        success: "Login success",
        access_token: authService.generateToken(username)
      }
    );
  }

  res.status(401).send({error: "Invalid credentials!"});
});

router.post('/validate', function (req, res, next) {
  const token = req.param('token');

  console.log('token "%s"', token)
  console.log(authService.isTokenValid(token));
  res.send("Test");
});

module.exports = router;
