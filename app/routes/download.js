/**
 * download.js
 * @type {createApplication}
 */
const express     = require('express');
const router      = express.Router();
const { exec }    = require('child_process');
const pathManager = require('../core/path-manager');

/* GET home page. */
router.get('/:downloadType', function (req, res, next) {
  if (req.params.downloadType) {

    /**
     * Request params
     */
    const download_type = req.params.downloadType;

    /**
     * Exec export binary
     */
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
          file = pathManager.getEmuServerPath('export/spells_us.txt');
          break;
        case "skills":
          file = pathManager.getEmuServerPath('export/SkillCaps.txt');
          break;
        case "basedata":
          file = pathManager.getEmuServerPath('export/BaseData.txt');
          break;
        case "dbstr":
          file = pathManager.getEmuServerPath('export/dbstr_us.txt');
          break;
        default:
      }

      /**
       * Get base file name
       */
      var path           = require('path');
      var base_file_name = path.basename(file).replace(".txt", "");
      var fs             = require('fs');
      var yazl           = require("yazl");
      var zipfile        = new yazl.ZipFile();

      zipfile.addFile(file, base_file_name + ".txt");

      console.log("zipping file: " + file);

      zipfile.outputStream.pipe(
        fs.createWriteStream(base_file_name + ".zip")
      ).on("close", function () {
        console.log("zip file downloaded: " + base_file_name + ".zip");
        res.download(base_file_name + ".zip");

        /**
         * Cleanup after 10s because the download callback doesn't work
         */
        setTimeout(function () {
          if (fs.existsSync(base_file_name + ".zip")) {
            fs.unlinkSync(base_file_name + ".zip");
          }
        }, 10000);
      });

      zipfile.end();
    });
  }
});

module.exports = router;