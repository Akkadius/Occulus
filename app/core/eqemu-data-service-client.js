/**
 * eqemu-data-service-client.js
 * @type {{exec: module.exports.exec}}
 */
let telnetService     = require('./telnet-service.js');
const websocketClient = require('./websocket-client');
const pathManager     = use('/app/core/path-manager');

module.exports = {

  /**
   * @return {boolean}
   */
  isJsonString: function (str) {
    try {
      JSON.parse(str);
    } catch (e) {
      return false;
    }
    return true;
  },

  /**
   * @returns {Promise<*>}
   */
  getZoneList: async function () {
    const response = await telnetService.execWorld('api get_zone_list');

    return (this.isJsonString(response) ? JSON.parse(response).data : []);
  },

  /**
   * @returns {Promise<*>}
   */
  getClientList: async function () {
    const response = await telnetService.execWorld('api get_client_list');

    return JSON.parse(response).data;
  },

  /**
   * @param port
   * @returns {Promise<*>}
   */
  getZoneNetStats: async function (port) {
    const response = await websocketClient.setPort(port).getZonePacketStatistics();

    return JSON.parse(response).data;
  },

  /**
   * @param port
   * @returns {Promise<*>}
   */
  getZoneAttributes: async function (port) {
    const response = await websocketClient.setPort(port).getZoneAttributes();

    return JSON.parse(response).data;
  },

  /**
   * @param port
   * @returns {Promise<*>}
   */
  getClientListDetail: async function (port) {
    const response = await websocketClient.setPort(port).getZoneClientListDetail();

    return JSON.parse(response).data;
  },

  /**
   * @param port
   * @returns {Promise<*>}
   */
  getNpcListDetail: async function (port) {
    const response = await websocketClient.setPort(port).getZoneNpcListDetail();

    return JSON.parse(response).data;
  },

  /**
   * @returns {Promise<string>}
   */
  getWorldUptime: async function () {
    let response = await telnetService.execWorld('uptime 0');
    if (!response) {
      return 0;
    }

    // reformat
    response = response.replace("Worldserver Uptime |", "")
    response = response.replaceAll(",", "")
    response = response.replace("and", "")
    response = response.replace(" Days", "d")
    response = response.replace(" Day", "d")
    response = response.replace(" Weeks", "w")
    response = response.replace(" Week", "w")
    response = response.replace(" Months", "m")
    response = response.replace(" Month", "m")
    response = response.replace(" Hours", "h")
    response = response.replace(" Hour", "h")
    response = response.replace(" Minutes", "m")
    response = response.replace(" Minute", "m")
    response = response.replace(" Seconds", "s")
    response = response.replace(" Second", "s")
    response = response.replace(/^\s+|\s+$/g, "")

    return response.trim();
  },

  /**
   * @returns {Promise<*>}
   */
  messageWorld: async function (message) {
    telnetService.execWorld('emote world 15 ' + message);
  },

  /**
   *
   * @param zoneShortName
   */
  hotReloadZoneQuests: async function (zoneShortName) {
    return telnetService.execWorld('reloadzonequests ' + zoneShortName);
  },

  /**
   *
   * @param zoneShortName
   */
  getDatabaseSchema: async function (zoneShortName) {
    let result

    try {
      result = require('child_process')
        .execSync('./bin/world database:schema', { cwd: pathManager.emuServerPath })
        .toString();
    } catch (e) {
      result = e.output.toString().replace(",{", "{").replace("\n,", "\n");
    }

    return JSON.parse(result);
  }
};
