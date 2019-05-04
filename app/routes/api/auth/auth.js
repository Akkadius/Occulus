const express = require('express');
const router  = express.Router();

router.get('/logout', function (req, res, next) {
  req.session.destroy();
  res.send({success: "Logged out"});
});

router.post('/login', function (req, res, next) {
  const username = req.body.username;
  const password = req.body.password;

  if (username === "admin" && password === "admin") {
    req.session.loggedIn = true;
    req.session.username = username;
    return res.send({success: "Login success"});
  }

  res.status(401).send({error: "Login incorrect!"});
});

module.exports = router;
