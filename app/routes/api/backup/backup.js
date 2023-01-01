const express            = require('express');
const router             = express.Router();
const eqemuConfigService = use('/app/core/eqemu-config-service')
const pathManager        = use('/app/core/path-manager')
const mysqldump          = use('/app/core/mysqldump-service')
const path               = require('path')
const fs                 = require('fs')
const yazl               = require('yazl');
const recursive          = require('recursive-readdir');
const slugify            = require('slugify')
const util               = require('util')
const os                 = require('os')

router.get('/:download', async function (req, res, next) {
  const timeoutSixtyMinutes = 1000 * 60 * 60;
  res.connection.setTimeout(timeoutSixtyMinutes);

  const download       = req.params.download;
  const serverLongName = eqemuConfigService.getServerLongName()
  const now            = new Date();
  const dateFileString = now.getFullYear() + '-' + now.getMonth() + '-' + now.getDate();
  const archiveName    = slugify(
    util.format('(%s)-%s-%s.zip', download, dateFileString, serverLongName.toLowerCase()),
    { remove : /[*+~()'"!:@]/g }
  )

  let requestedDownloadPath = '';
  switch (download) {
    case 'quests':
      requestedDownloadPath = download;
      break;
    case 'maps':
      requestedDownloadPath = download;
      break;
    case 'lua_modules':
      requestedDownloadPath = download;
      break;
    case 'database':
      break;
    case 'full':
      requestedDownloadPath = './';
      break;
    default:
      res.json({ error : 'Invalid download requested' })
  }

  if (download === 'database') {
    const dumpFile = mysqldump.dump()
    const zip      = new yazl.ZipFile();
    const zipFile  = path.join(os.tmpdir(), path.basename(dumpFile) + '.zip')
    zip.addFile(dumpFile, path.basename(dumpFile));

    zip.outputStream.pipe(
      fs.createWriteStream(zipFile)
    ).on('close', function () {

      if (fs.existsSync(dumpFile)) {
        fs.unlinkSync(dumpFile);
      }

      res.download(zipFile, path.basename(zipFile), function (err) {
        if (fs.existsSync(dumpFile)) {
          fs.unlinkSync(dumpFile);
        }
      });
    });

    zip.end();
  }

  if (requestedDownloadPath !== '') {
    const realPath = path.join(pathManager.getEmuServerPath(), requestedDownloadPath)
    const zipFile  = path.join(os.tmpdir(), archiveName)
    let zip        = new yazl.ZipFile();

    console.log(realPath)

    const files = await recursive(realPath)

    console.log(files)

    files.forEach(function (file) {
      const baseServerFilePath          = file.replace(pathManager.getEmuServerPath(), '')
      const firstLevelFile              = baseServerFilePath.split('/')[0]
      const ignoreBackupFirstLevelFiles = [
        'backups',
        'eqemu-web',
        'eqemu-admin',
        'db_update',
        'updates_staged',
        'logs',
        'shared',
        'export'
      ];

      if (ignoreBackupFirstLevelFiles.includes(firstLevelFile)) {
        console.debug('[backup.js] Skipping file/folder [%s]', firstLevelFile)
        return;
      }

      const baseFile = path.basename(file)
      if (baseFile.includes('.zip')) {
        console.debug('[backup.js] Skipping .zip file [%s]', baseFile)
        return;
      }

      let zipPath = file.replace(pathManager.getEmuServerPath(), '')
      console.debug('[backup.js] Adding file [%s] to zipPath [%s]', file, zipPath)
      zip.addFile(file, zipPath);
    });

    if (download === 'full') {
      const dumpFile = mysqldump.dump()
      zip.addFile(dumpFile, path.join('database', path.basename(dumpFile)));
    }

    zip.outputStream.pipe(
      fs.createWriteStream(zipFile)
    ).on('close', function () {
      console.debug('zip file downloaded: ' + zipFile);

      res.download(zipFile, path.basename(zipFile), function (err) {
        fs.unlinkSync(zipFile);
        if (download === 'full') {
          fs.unlinkSync(mysqldump.getBackupFullSqlFilePath());
        }
      });
    });

    zip.end();

  }
});

module.exports = router;
