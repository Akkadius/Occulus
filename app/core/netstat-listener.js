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
  listening_ports: {},

  /**
   * @int
   * Time before listener stops polling for data
   */
  max_listening_timeout: 60,

  /**
   * Number of seconds that the listener will retain data
   *
   * @int
   */
  max_series_store_time: 120,

  /**
   * For keeping track of sent packet types last listening round
   */
  sent_packet_types_last_analyzed: [],

  /**
   * Keeps track of rolling series data for sent packet types
   */
  sent_packet_types_series_data: [],

  /**
   * For keeping track of receive packet types last listening round
   */
  receive_packet_types_last_analyzed: [],

  /**
   * Keeps track of rolling series data for receive packet types
   */
  receive_packet_types_series_data: [],

  /**
   * Set our listening port to current unix time to compare later
   *
   * @param port
   */
  addListener: function (port) {
    this.listening_ports[port] = Math.floor(new Date() / 1000);
  },

  /**
   * Remove listener
   *
   * @param port
   */
  removeListener: function (port) {
    delete this.listening_ports[port];
  },

  /**
   *
   * @returns {module.exports.listening_ports|{}}
   */
  getListeningPorts: function () {
    return this.listening_ports;
  },

  /**
   * Prune data back
   */
  prune: function () {
    for (let port in this.getListeningPorts()) {

      /**
       * Prune sent packet series data
       */
      for (let packet_type in this.sent_packet_types_series_data[port]) {
        for (let time_entry in this.sent_packet_types_series_data[port][packet_type]) {
          let unix_time = Math.floor(new Date() / 1000);
          if (time_entry < (unix_time - this.max_series_store_time)) {
            // console.debug("deleting packet_type: %s time_entry: %s", packet_type, time_entry);
            delete this.sent_packet_types_series_data[port][packet_type][time_entry];
          }
        }
      }

      /**
       * Prune receive packet series data
       */
      for (let packet_type in this.receive_packet_types_series_data[port]) {
        for (let time_entry in this.receive_packet_types_series_data[port][packet_type]) {
          let unix_time = Math.floor(new Date() / 1000);
          if (time_entry < (unix_time - this.max_series_store_time)) {
            // console.debug("deleting packet_type: %s time_entry: %s", packet_type, time_entry);
            delete this.receive_packet_types_series_data[port][packet_type][time_entry];
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
      if (listen_time < (unix_time - this.max_listening_timeout)) {
        console.debug("Removing netstat-listener via port %s", port);
        this.removeListener(port);
        delete this.sent_packet_types_last_analyzed[port];
        delete this.sent_packet_types_series_data[port];
        delete this.receive_packet_types_last_analyzed[port];
        delete this.receive_packet_types_series_data[port];
        continue;
      }

      /**
       * Process stats
       */
      dataService.getZoneNetStats(port).then(response => {
        if (response) {
          response.forEach(function (row) {
            module.exports.parseSentPacketTypes(port, row);
            module.exports.parseReceivePacketTypes(port, row);
          });
        }
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
     * Initialize: this.last_analyzed_sent_types_data
     */
    if (typeof this.sent_packet_types_last_analyzed[port] === "undefined") {
      this.sent_packet_types_last_analyzed[port] = {};
    }

    if (typeof this.sent_packet_types_last_analyzed[port][client_name] === "undefined") {
      this.sent_packet_types_last_analyzed[port][client_name] = [];
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

      if (typeof this.sent_packet_types_last_analyzed[port][client_name][sent_packet_type_key] === "undefined") {
        this.sent_packet_types_last_analyzed[port][client_name][sent_packet_type_key] = sent_packet_type_value;
      } else {

        /**
         * Record the deltas
         */
        const last_value = this.sent_packet_types_last_analyzed[port][client_name][sent_packet_type_key];
        if (last_value !== sent_packet_type_value) {
          this.sent_packet_types_last_analyzed[port][client_name][sent_packet_type_key] = sent_packet_type_value;

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
          if (typeof this.sent_packet_types_series_data[port] === "undefined") {
            this.sent_packet_types_series_data[port] = {};
          }
          if (typeof this.sent_packet_types_series_data[port][sent_packet_type_key] === "undefined") {
            this.sent_packet_types_series_data[port][sent_packet_type_key] = {};
          }
          if (typeof this.sent_packet_types_series_data[port][sent_packet_type_key][unix_time] === "undefined") {
            this.sent_packet_types_series_data[port][sent_packet_type_key][unix_time] = 0;
          }

          /**
           * Record delta
           */
          if (this.sent_packet_types_series_data[port][sent_packet_type_key][unix_time] > 0) {
            this.sent_packet_types_series_data[port][sent_packet_type_key][unix_time] += delta;
          } else {
            this.sent_packet_types_series_data[port][sent_packet_type_key][unix_time] = delta;
          }

          console.debug("Recording (sent) delta on port (%s) (%s) unix: %s on type (%s), last value: %s new value: %s",
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

  /**
   * Parse receive packet types
   *
   * @param row
   */
  parseReceivePacketTypes: function (port, row) {
    let client_name = row.client_name;
    let unix_time   = Math.floor(new Date() / 1000);

    /**
     * Initialize: this.last_analyzed_receive_types_data
     */
    if (typeof this.receive_packet_types_last_analyzed[port] === "undefined") {
      this.receive_packet_types_last_analyzed[port] = {};
    }

    if (typeof this.receive_packet_types_last_analyzed[port][client_name] === "undefined") {
      this.receive_packet_types_last_analyzed[port][client_name] = [];
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
    for (let receive_packet_type_key in row.receive_packet_types) {
      // receive_packet_type_key = receive_packet_type_key.toString();
      let receive_packet_type_value = row.receive_packet_types[receive_packet_type_key];

      // console.log(receive_packet_type_key);
      // console.log(receive_packet_type_value);

      if (typeof this.receive_packet_types_last_analyzed[port][client_name][receive_packet_type_key] === "undefined") {
        this.receive_packet_types_last_analyzed[port][client_name][receive_packet_type_key] = receive_packet_type_value;
      } else {

        /**
         * Record the deltas
         */
        const last_value = this.receive_packet_types_last_analyzed[port][client_name][receive_packet_type_key];
        if (last_value !== receive_packet_type_value) {
          this.receive_packet_types_last_analyzed[port][client_name][receive_packet_type_key] = receive_packet_type_value;

          /**
           * If no delta, continue
           */
          const delta = receive_packet_type_value - last_value;
          if (delta < 0) {
            continue;
          }

          /**
           * Initialize: time_series_data
           */
          if (typeof this.receive_packet_types_series_data[port] === "undefined") {
            this.receive_packet_types_series_data[port] = {};
          }
          if (typeof this.receive_packet_types_series_data[port][receive_packet_type_key] === "undefined") {
            this.receive_packet_types_series_data[port][receive_packet_type_key] = {};
          }
          if (typeof this.receive_packet_types_series_data[port][receive_packet_type_key][unix_time] === "undefined") {
            this.receive_packet_types_series_data[port][receive_packet_type_key][unix_time] = 0;
          }

          /**
           * Record delta
           */
          if (this.receive_packet_types_series_data[port][receive_packet_type_key][unix_time] > 0) {
            this.receive_packet_types_series_data[port][receive_packet_type_key][unix_time] += delta;
          } else {
            this.receive_packet_types_series_data[port][receive_packet_type_key][unix_time] = delta;
          }

          console.debug("Recording (receive) delta on port (%s) (%s) unix: %s on type (%s), last value: %s new value: %s",
            port,
            delta,
            unix_time,
            receive_packet_type_key,
            last_value,
            receive_packet_type_value
          );

        }
      }
    }
  },

};