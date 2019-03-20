/**
 * eqemu-data-service-client.js
 * @type {{check: module.exports.check}}
 */
let telnetService = require('./telnet-service.js');

/**
 * @type {{getZoneList: (function(): *)}}
 */
module.exports = {

  /**
   * @returns {Promise<*>}
   */
  getZoneList: async function () {
    const response = await telnetService.execWorld("api get_zone_list");

    return JSON.parse(response).data;
  },

  /**
   * @param port
   * @returns {Promise<*>}
   */
  getZoneNetStats: async function (port) {
    const response = await telnetService.execZone(port, "api get_packet_statistics");

    return JSON.parse(response).data;
  },
};