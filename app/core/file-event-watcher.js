const discordWebhook = use('/app/core/discord-webhook')
const pathManager    = use('/app/core/path-manager')
const watch          = require('node-watch');
const util           = require('util');
const path           = require('path');
const chalk          = require('chalk');
const fs             = require('fs');

module.exports = {
  message: function (message) {
    console.log(util.format(chalk`{green [{bold FileEventWatcher}] %s }`, message))
  },

  watchCrashLogs() {
    this.message('Starting crash log watcher...')

    const watchPath = path.join(pathManager.getEmuServerPath(), 'logs/crashes')

    if (!fs.existsSync(watchPath)) {
      fs.mkdirSync(watchPath, { recursive: true });
    }

    if (fs.existsSync(watchPath)) {
      watch(watchPath, { recursive: false }, function (evt, file) {
        if (!['log'].includes(file.split('.').pop())) {
          return false
        }

        if (evt === 'update') {
          const fileName = path.basename(file);
          fs.readFile(file, 'utf8', function (err, contents) {
            const crash = contents;
            let lines = ""
            crash.split("\n").forEach((line) => {
              const l = line.split("[Crash] ").pop();
              if (l.includes("New LWP")) {
                return false
              }

              lines = lines + l + "\n";
            })

            discordWebhook.sendCrashLog(fileName, lines.trim())
          });

          console.log(file)
          console.log(fileName)

        }
      });
    }
  }
}
