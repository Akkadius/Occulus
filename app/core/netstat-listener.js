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
  maxListeningTimeout: 60,

  /**
   * Number of seconds that the listener will retain data
   *
   * @int
   */
  maxSeriesStoreTime: 120,

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
   * Prune data back
   */
  prune: function () {
    for (let port in this.getListeningPorts()) {

      /**
       * Prune sent packet series data
       */
      for (let packet_type in sent_packet_series_data[port]) {
        for (let time_entry in sent_packet_series_data[port][packet_type]) {
          let unix_time = Math.floor(new Date() / 1000);
          if (time_entry < (unix_time - this.maxSeriesStoreTime)) {
            // console.debug("deleting packet_type: %s time_entry: %s", packet_type, time_entry);
            delete sent_packet_series_data[port][packet_type][time_entry];
          }
        }
      }
    }
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
        delete sent_packet_series_data[port];
      }

      dataService.getZoneNetStats(port).then(response => {
        response.forEach(function (row) {
          module.exports.parseSentPacketTypes(port, row);
        });
      });
    }
  },

  /**
   * Parse sent packet types
   *
   * @param row
   */
  parseSentPacketTypes: function (port, row) {
    let client_name = row.client_name;
    let unix_time   = Math.floor(new Date() / 1000);

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
  },

};