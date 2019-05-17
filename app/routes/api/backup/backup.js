const express            = require('express');
const router             = express.Router();
const eqemuConfigService = require('../../../core/eqemu-config-service')
const pathManager        = require('../../../core/path-manager')
const path               = require('path')
const fs                 = require('fs')
const yazl               = require("yazl");
const recursive          = require("recursive-readdir");
const slugify            = require('slugify')
const util               = require('util')

router.get('/:download', async function (req, res, next) {
  const timeoutThirtyMinutes = 1000 * 60 * 30;
  res.connection.setTimeout(timeoutThirtyMinutes);

  const download       = req.params.download;
  const serverLongName = eqemuConfigService.getServerLongName()
  const now            = new Date();
  const dateFileString = now.getFullYear() + "-" + now.getMonth() + "-" + now.getDate();
  const archiveName    = slugify(
    util.format('(%s)-%s-%s.zip', download, dateFileString, serverLongName.toLowerCase()),
    {remove: /[*+~()'"!:@]/g}
  )

  let requestedDownloadPath;
  switch (download) {
    case "quests":
      requestedDownloadPath = download;
      break;
    case "maps":
      requestedDownloadPath = download;
      break;
    case "lua_modules":
      requestedDownloadPath = download;
      break;
    default:
      res.json({error: 'Invalid download requested'})
  }

  const realPath = path.join(pathManager.getEmuServerPath(), requestedDownloadPath)
  const zipFile  = path.join(pathManager.getEmuServerPath(), archiveName)
  let zip        = new yazl.ZipFile();

  recursive(realPath, function (err, files) {
    files.forEach(function (file) {
      var zipPath = file.replace(realPath + "/", "")
      zip.addFile(file, zipPath);
      console.debug("[backup.js] Adding file [%s] to zipPath [%s]", file, zipPath)
    });

    zip.outputStream.pipe(
      fs.createWriteStream(zipFile)
    ).on("close", function () {
      console.debug("zip file downloaded: " + zipFile);

      res.download(zipFile, path.basename(zipFile), function (err) {
        fs.unlinkSync(zipFile);
      });
    });

    zip.end();
  });
});

module.exports = router;
