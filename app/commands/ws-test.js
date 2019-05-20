/**
 * @type {{check: module.exports.check}}
 */
const websocketClient = require('../../app/core/websocket-client');

module.exports = {
  test: async function (port) {
    console.log(await websocketClient.setPort(port).getZoneAttributes())
  },
};
