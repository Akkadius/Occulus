/**
 * download.js
 * @type {createApplication}
 */
var express  = require('express');
var router   = express.Router();
const {exec} = require('child_process');

/* GET home page. */
router.get('/:downloadType', function (req, res, next) {
  if (req.params.downloadType) {
    const download_type = req.params.downloadType;
    exec('cd ../ && ./export_client_files ' + download_type, (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        return;
      }

      /**
       * @type {string}
       */
      let file = "";
      switch (download_type) {
        case "spells":
          file = __dirname + '../../../export/spells_us.txt';
          break;
        case "skills":
          file = __dirname + '../../../export/SkillCaps.txt';
          break;
        case "basedata":
          file = __dirname + '../../../export/BaseData.txt';
          break;
        case "dbstr":
          file = __dirname + '../../../export/dbstr_us.txt';
          break;
        default:
      }

      res.download(file);
    });
  }
});

module.exports = router;