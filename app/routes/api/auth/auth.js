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
    req.session.save();

    return res.send({success: "Login success"});
  }

  res.status(401).send({error: "Invalid credentials!"});
});

module.exports = router;
