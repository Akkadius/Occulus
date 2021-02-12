const config = use('/app/core/eqemu-config-service');
const util   = require('util');
const axios  = require('axios');

module.exports = {
  sendCrashLog(fileName, contents) {
    const webhookUrl = config.getAdminPanelConfig('discord.crash_log_webhook', '').trim();
    const serverName = config.getServerLongName();
    if (webhookUrl !== '') {
      let header = util.format('**Crash Report** | **Server** [%s] **File** [%s] ', serverName, fileName);
      this.sendMessage(webhookUrl, header, contents);
    }
  },

  async sendMessage(webhookUrl, header, contents) {
    let chunkCount = 1;
    for (const chunk of this.chunkSubstr(contents, 1800)) {
      await axios.post(webhookUrl, {
          content: header + ' **Chunk** [' + chunkCount + ']\n```\n' + chunk + '\n```'
        }
      ).catch(function (error) {
        console.log(error);
        console.log(error.response);
      });
      chunkCount++;
    }
  },

  chunkSubstr(str, size) {
    const numChunks = Math.ceil(str.length / size)
    const chunks    = new Array(numChunks)

    for (let i = 0, o = 0; i < numChunks; ++i, o += size) {
      chunks[i] = str.substr(o, size)
    }

    return chunks
  }
}
