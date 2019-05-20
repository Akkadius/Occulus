/**
 * eqemu-data-service-client.js
 * @type {{check: module.exports.check}}
 */
let telnetService     = require('./telnet-service.js');
const websocketClient = require('./websocket-client');

/**
 * @type {{getZoneList: (function(): *)}}
 */
module.exports = {
  /**
   * @returns {Promise<*>}
   */
  getZoneList : async function () {
    const response = await telnetService.execWorld('api get_zone_list');

    return JSON.parse(response).data;
  },

  /**
   * @returns {Promise<*>}
   */
  getClientList : async function () {
    const response = await telnetService.execWorld('api get_client_list');

    return JSON.parse(response).data;
  },

  /**
   * @param port
   * @returns {Promise<*>}
   */
  getZoneNetStats : async function (port) {
    const response = await websocketClient.setPort(port).getZonePacketStatistics();

    return JSON.parse(response).data;
  },

  /**
   * @param port
   * @returns {Promise<*>}
   */
  getZoneAttributes : async function (port) {
    const response = await websocketClient.setPort(port).getZoneAttributes();

    return JSON.parse(response).data;
  },

  /**
   * @param port
   * @returns {Promise<*>}
   */
  getClientListDetail : async function (port) {
    const response = await websocketClient.setPort(port).getZoneClientListDetail();

    return JSON.parse(response).data;
  },

  /**
   * @param port
   * @returns {Promise<*>}
   */
  getNpcListDetail : async function (port) {
    const response = await websocketClient.setPort(port).getZoneNpcListDetail();

    return JSON.parse(response).data;
  },

  /**
   * @returns {Promise<string>}
   */
  getWorldUptime : async function () {
    const response = await telnetService.execWorld('uptime 0');
    if (!response) {
      return 0;
    }

    return response.replace('Worldserver Uptime: ', '').trim();
  },
};
