/**
 * @type {{check: module.exports.check}}
 */
const WebSocket = require('ws');

module.exports = {
  wsPort : null,
  getZoneOpcodeList : async function () {
    return await this.simpleGet('get_opcode_list')
  },
  getZonePacketStatistics : async function () {
    return await this.simpleGet('get_packet_statistics')
  },
  getZoneNpcListDetail : async function () {
    return await this.simpleGet('get_npc_list_detail')
  },
  getZoneDoorListDetail : async function () {
    return await this.simpleGet('get_door_list_detail')
  },
  getZoneCorpseListDetail : async function () {
    return await this.simpleGet('get_corpse_list_detail')
  },
  getZoneObjectListDetail : async function () {
    return await this.simpleGet('get_object_list_detail')
  },
  getZoneMobListDetail : async function () {
    return await this.simpleGet('get_mob_list_detail')
  },
  getZoneClientListDetail : async function () {
    return await this.simpleGet('get_client_list_detail')
  },
  getZoneAttributes : async function () {
    return await this.simpleGet('get_zone_attributes')
  },
  setPort : function (port) {
    this.wsPort = port;

    return this
  },
  simpleGet : async function (method) {
    var self = this;
    try {
      return await new Promise(async function (resolve, reject) {

        if (self.wsPort === null) {
          throw new Error('Websocket port is not set!')
        }

        var ws = new WebSocket('ws://127.0.0.1:' + self.wsPort);

        ws.onerror = function (event) {
          console.log(event)
          reject(event)
        }

        ws.on('error', (error) => {
          console.log('client error', error);
          reject(error)
        });

        ws.on('uncaughtException', function (err) {
          console.log('UNCAUGHT EXCEPTION - keeping process alive:', err); // err.message is "foobar"
        });

        ws.onclose = function (event) {
          // console.log(event)
          reject(event)
        }

        try {
          ws.onopen = function (event) {
            var connectionUuid = self.generateUUID();
            ws.send(JSON.stringify({
              id : connectionUuid,
              method : 'login',
              params : ['admin']
            }, null, 2))

            ws.send(JSON.stringify(
              {
                id : connectionUuid,
                method : method,
              }, null, 2));

            ws.onmessage = function (event) {
              var response = JSON.parse(event.data)
              if (response && response.data && typeof response.data.status === 'undefined') {
                resolve(event.data);
                ws.terminate()
              }
            }
          }
        } catch (e) {
          console.log('Open' + e)
        }

      });
    } catch (e) {
      console.log(e)
    }
  },
  generateUUID : function () {
    let dateTime = new Date().getTime();
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var random = (dateTime + Math.random() * 16) % 16 | 0;
      dateTime   = Math.floor(dateTime / 16);
      return (c === 'x' ? random : (random & 0x3 | 0x8)).toString(16);
    });
  }
};
