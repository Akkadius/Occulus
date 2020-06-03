/**
 * download.js
 * @type {createApplication}
 */
const express     = require('express');
const router      = express.Router();
const { exec }    = require('child_process');
const pathManager = require('../core/path-manager');
const fs          = require('fs')
const path        = require('path');


router.get('/:downloadType', function (req, res, next) {
  if (req.params.downloadType) {

    /**
     * Request params
     */
    const downloadType = req.params.downloadType;
    const emuPath      = pathManager.getEmuServerPath();
    const exportPath   = path.join(emuPath, 'export')

    if (!fs.existsSync(exportPath)) {
      fs.mkdirSync(exportPath)
    }

    let command = 'cd ../ && ./bin/export_client_files ' + downloadType;
    const spellsFile = path.join(emuPath, 'export/spells_us.txt');
    if (fs.existsSync(spellsFile)) {
      const stats                = fs.statSync(spellsFile);
      const modifiedTimeUnix     = stats.mtimeMs / 1000;
      const unixNow              = Math.floor(Date.now() / 1000)
      const secondsSinceModified = unixNow - modifiedTimeUnix

      if (secondsSinceModified < 60) {
        command = 'echo "noop"';
      }
    }

    /**
     * Exec export binary
     */
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        return;
      }

      /**
       * @type {string}
       */
      let file = '';
      switch (downloadType) {
        case 'spells':
          file = path.join(emuPath, 'export/spells_us.txt');
          break;
        case 'skills':
          file = path.join(emuPath, 'export/SkillCaps.txt');
          break;
        case 'basedata':
          file = path.join(emuPath, 'export/BaseData.txt');
          break;
        case 'dbstr':
          file = path.join(emuPath, 'export/dbstr_us.txt');
          break;
        default:
      }

      /**
       * Get base file name
       */
      const base_file_name = path.basename(file).replace('.txt', '');
      const fs             = require('fs');
      const yazl           = require('yazl');
      const zipfile        = new yazl.ZipFile();

      zipfile.addFile(file, base_file_name + '.txt');
      zipfile.outputStream.pipe(
        fs.createWriteStream(base_file_name + '.zip')
      ).on('close', function () {
        console.log('zip file downloaded: ' + base_file_name + '.zip');
        res.download(base_file_name + '.zip');

        /**
         * Cleanup after 10s because the download callback doesn't work
         */
        setTimeout(function () {
          if (fs.existsSync(base_file_name + '.zip')) {
            fs.unlinkSync(base_file_name + '.zip');
          }
        }, 10000);
      });

      zipfile.end();
    });
  }
});

module.exports = router;
