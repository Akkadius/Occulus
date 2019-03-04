var express        = require('express');
var router         = express.Router();
var templateRender = require('../app/core/template-render');

/* GET home page. */
router.get('/', function (req, res, next) {
  res.send(templateRender.getTemplate("index"));
});

module.exports = router;
