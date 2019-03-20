/**
 * netstat-listener.js
 * @type {{getZoneList: (function(): *), getZoneNetStats: (function(*=): *)}}
 */
let dataService = require('./eqemu-data-service-client.js');

module.exports = {

  /**
   * @returns {Promise<*>}
   */
  listen: function () {

    dataService.getZoneNetStats(7000).then(response => {
      const unix_time = Math.floor(new Date() / 1000);

      /**
       * Prune back data
       */
      for (let series_time_unix in time_series_data) {
        if (series_time_unix < (unix_time - max_seconds_series_store)) {
          // console.log("%s falls behind store window, deleting...", series_time_unix);
          delete global.time_series_data[series_time_unix];
        }
      }

      /**
       * Loop through packet data
       */
      response.forEach(function (row) {
        const data_set_key = row['client_name'];

        /**
         * Initialize: last_analyzed_data
         */
        if (typeof last_analyzed_data[data_set_key] === "undefined") {
          last_analyzed_data[data_set_key] = [];
        }

        if (typeof last_analyzed_data[data_set_key]['sent_packet_types'] === "undefined") {
          last_analyzed_data[data_set_key]['sent_packet_types'] = [];
        }

        /**
         * Loop through sent packet types
         */
        for (let sent_packet_type_key in row.sent_packet_types) {
          // sent_packet_type_key = sent_packet_type_key.toString();
          let sent_packet_type_value = row.sent_packet_types[sent_packet_type_key];

          if (typeof last_analyzed_data[data_set_key]['sent_packet_types'][sent_packet_type_key] === "undefined") {
            last_analyzed_data[data_set_key]['sent_packet_types'][sent_packet_type_key] = sent_packet_type_value;
          } else {

            /**
             * Record the deltas
             */
            const last_value = last_analyzed_data[data_set_key]['sent_packet_types'][sent_packet_type_key];
            if (last_value !== sent_packet_type_value) {
              last_analyzed_data[data_set_key]['sent_packet_types'][sent_packet_type_key] = sent_packet_type_value;

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
              if (typeof time_series_data[unix_time] === "undefined") {
                time_series_data[unix_time] = [];
              }

              if (typeof time_series_data[unix_time]['sent_packet_types'] === "undefined") {
                time_series_data[unix_time]['sent_packet_types'] = [];
              }

              if (typeof time_series_data[unix_time]['sent_packet_types'][sent_packet_type_key] === "undefined") {
                time_series_data[unix_time]['sent_packet_types'][sent_packet_type_key] = 0;
              }

              /**
               * Record delta
               */
              time_series_data[unix_time]['sent_packet_types'][sent_packet_type_key] = delta;

              console.log("Recording delta (%s) via client (%s) on type (%s), last value: %s new value: %s",
                delta,
                data_set_key,
                sent_packet_type_key,
                last_value,
                sent_packet_type_value
              );

            }
          }
        }
      });

    });
  },
};