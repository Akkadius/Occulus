const Telnet   = require('telnet-client')
var connection = new Telnet()

/**
 * telnet-service
 * @type {{exec: module.exports.exec}}
 */
module.exports = {

  /**
   * Execute command
   *
   * @param command
   */
  exec: async function (command) {

    try {

      /**
       * Setup
       *
       * @type {{maxBufferLength: string, shellPrompt: string, port: number, host: string, timeout: number}}
       */
      await connection.connect(
        {
          host: '127.0.0.1',
          port: 9000,
          shellPrompt: '>',
          timeout: 10,
          maxBufferLength: '10M',
        }
      );

      const response = await connection.send(
        command,
        {
          waitfor: '> $',
          maxBufferLength: '10M'
        }
      );

      return response.replace("\n\r>", "").trim();

    } catch (error) {
      console.log(error);
    }

  },

  /**
   * Execute command
   *
   * @param command
   */
  execWorld: async function (command) {

    try {

      /**
       * Setup
       *
       * @type {{maxBufferLength: string, shellPrompt: string, port: number, host: string, timeout: number}}
       */
      await connection.connect(
        {
          host: '127.0.0.1',
          port: 9000,
          shellPrompt: '>',
          timeout: 10,
          maxBufferLength: '10M',
        }
      );

      const response = await connection.send(
        command,
        {
          waitfor: '> $',
          maxBufferLength: '10M'
        }
      );

      return response.replace("\n\r>", "").trim();

    } catch (error) {
      console.log(error);
    }

  },
};