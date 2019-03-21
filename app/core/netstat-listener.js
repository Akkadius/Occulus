/**
 * netstat-listener.js
 * @type {{getZoneList: (function(): *), getZoneNetStats: (function(*=): *)}}
 */
let dataService = require('./eqemu-data-service-client.js');

/**
 * @type {{listen: module.exports.listen}}
 */
module.exports = {

  /**
   * @string
   */
  listeningPorts: {},

  /**
   * @int
   * Time before listener stops polling for data
   */
  maxListeningTimeout: 10,

  /**
   * Set our listening port to current unix time to compare later
   *
   * @param port
   */
  addListener: function (port) {
    this.listeningPorts[port] = Math.floor(new Date() / 1000);
  },

  /**
   * Remove listener
   *
   * @param port
   */
  removeListener: function (port) {
    delete this.listeningPorts[port];
  },

  /**
   *
   * @returns {module.exports.listeningPorts|{}}
   */
  getListeningPorts: function () {
    return this.listeningPorts;
  },

  /**
   * @returns {Promise<*>}
   */
  listen: function () {
    for (let port in this.getListeningPorts()) {
      let listen_time = this.getListeningPorts()[port];
      let unix_time   = Math.floor(new Date() / 1000);

      /**
       * Prune listeners who have dropped off
       */
      if (listen_time < (unix_time - this.maxListeningTimeout)) {
        console.debug("Removing netstat-listener via port %s", port);
        this.removeListener(port);
        delete global.sent_packet_series_data[port];
      }

      dataService.getZoneNetStats(port).then(response => {
        let unix_time = Math.floor(new Date() / 1000);

        /**
         * Prune back data
         */
        for (let series_time_unix in sent_packet_series_data) {
          if (series_time_unix < (unix_time - max_seconds_series_store)) {
            // console.log("%s falls behind store window, deleting...", series_time_unix);
            delete global.sent_packet_series_data[port][series_time_unix];
          }
        }

        /**
         * Loop through packet data
         */
        response.forEach(function (row) {

          let client_name = row.client_name;

          /**
           * Initialize: last_analyzed_data
           */
          if (typeof last_analyzed_data[client_name] === "undefined") {
            last_analyzed_data[client_name] = [];
          }

          /**
           * Loop through sent packet types
           *
           * { OP_AAExpUpdate: 1,
           *   OP_AggroMeterTargetInfo: 7,
           *   OP_AltCurrency: 1,
           *   OP_BlockedBuffs: 2 ... }
           *
           */
          for (let sent_packet_type_key in row.sent_packet_types) {
            // sent_packet_type_key = sent_packet_type_key.toString();
            let sent_packet_type_value = row.sent_packet_types[sent_packet_type_key];

            // console.log(sent_packet_type_key);
            // console.log(sent_packet_type_value);

            if (typeof last_analyzed_data[client_name][sent_packet_type_key] === "undefined") {
              last_analyzed_data[client_name][sent_packet_type_key] = sent_packet_type_value;
            } else {

              /**
               * Record the deltas
               */
              const last_value = last_analyzed_data[client_name][sent_packet_type_key];
              if (last_value !== sent_packet_type_value) {
                last_analyzed_data[client_name][sent_packet_type_key] = sent_packet_type_value;

                /**
                 * If no delta, continue
                 */
                const delta = sent_packet_type_value - last_value;
                if (delta < 0) {
                  continue;
                }

                /**
                 * Initialize: time_series_data
                 */
                if (typeof sent_packet_series_data[port] === "undefined") {
                  sent_packet_series_data[port] = {};
                }
                if (typeof sent_packet_series_data[port][sent_packet_type_key] === "undefined") {
                  sent_packet_series_data[port][sent_packet_type_key] = {};
                }
                if (typeof sent_packet_series_data[port][sent_packet_type_key][unix_time] === "undefined") {
                  sent_packet_series_data[port][sent_packet_type_key][unix_time] = 0;
                }

                /**
                 * Record delta
                 */
                if (sent_packet_series_data[port][sent_packet_type_key][unix_time] > 0) {
                  sent_packet_series_data[port][sent_packet_type_key][unix_time] += delta;
                } else {
                  sent_packet_series_data[port][sent_packet_type_key][unix_time] = delta;
                }

                console.debug("Recording delta on port (%s) (%s) unix: %s on type (%s), last value: %s new value: %s",
                  port,
                  delta,
                  unix_time,
                  sent_packet_type_key,
                  last_value,
                  sent_packet_type_value
                );

              }
            }
          }
        });

      });
    }
  },
};