const Telnet = require('telnet-client')

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
  execWorld: async function (command) {
    let worldConnection = new Telnet()

    worldConnection.on('error', function () {
      console.log('execWorld: Cannot connect to world process!');
      return false;
    });

    /**
     * Setup
     *
     * @type {{maxBufferLength: string, shellPrompt: string, port: number, host: string, timeout: number}}
     */
    await worldConnection.connect(
      {
        host: '127.0.0.1',
        port: 9000,
        shellPrompt: '>',
        timeout: 1000,
        execTimeout: 1000,
        maxBufferLength: '10M',
      }
    );

    const worldResponse = await worldConnection.send(
      command,
      {
        waitfor: '> $',
        maxBufferLength: '10M'
      }
    );

    worldConnection.send("quit", {
        waitfor: 'Connection closed by foreign host$',
        maxBufferLength: '10M'
      }
    );

    worldConnection.destroy();

    return worldResponse.replace("\n\r>", "").trim();


  },

  /**
   * Execute command
   *
   * @param port
   * @param command
   */
  execZone: async function (port, command) {

    try {

      let zoneConnection   = [];
      zoneConnection[port] = new Telnet();

      zoneConnection[port].on('error', function () {
        console.log('execZone: [%s] Cannot connect to zone process!', port);
        return false;
      });

      /**
       * Setup
       *
       * @type {{maxBufferLength: string, shellPrompt: string, port: number, host: string, timeout: number}}
       */
      await zoneConnection[port].connect(
        {
          host: '127.0.0.1',
          port: port,
          shellPrompt: '>',
          timeout: 1000,
          execTimeout: 1000,
          maxBufferLength: '10M',
        }
      );

      const zoneResponse = await zoneConnection[port].send(
        command,
        {
          waitfor: '> $',
          maxBufferLength: '10M'
        }
      );

      zoneConnection[port].send("quit", {
          waitfor: 'Connection closed by foreign host$',
          maxBufferLength: '10M'
        }
      );

      zoneConnection[port].destroy();

      return zoneResponse.replace("\n\r>", "").trim();

    } catch (error) {
      console.log(error);
    }

  },
};