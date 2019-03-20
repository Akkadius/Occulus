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
};