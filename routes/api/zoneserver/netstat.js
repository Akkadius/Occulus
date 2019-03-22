/**
 * test.js
 * @type {createApplication}
 */
let express         = require('express');
let router          = express.Router();
let moment          = require('moment');
let netstatListener = require('../../../app/core/netstat-listener');

router.get('/:port/chart', function (req, res, next) {
  const unix_time   = Math.floor(new Date() / 1000);
  const min_seconds = (unix_time - netstatListener.max_series_store_time);
  const port        = req.params.port;

  /**
   * Add our listener
   */
  netstatListener.addListener(port);

  let clients;
  let packet_loss_inbound_columns  = [];
  let packet_loss_outbound_columns = [];
  let ping_columns                 = [];
  let receive_bytes_columns        = [];
  let receive_packet_type_columns  = [];
  let resent_fragments_columns     = [];
  let resent_non_fragments_columns = [];
  let resent_packets_columns       = [];
  let sent_bytes_columns           = [];
  let sent_packet_type_columns     = [];
  let stat;

  /**
   * Set Chart X axis data (Time)
   * @type {string[]}
   */
  let x_axis_row = ['x'];
  for (let time = min_seconds; time <= unix_time; time++) {
    x_axis_row.push(moment.unix(time).format("HH:mm:ss"));
  }
  packet_loss_inbound_columns.push(x_axis_row);
  packet_loss_outbound_columns.push(x_axis_row);
  ping_columns.push(x_axis_row);
  receive_bytes_columns.push(x_axis_row);
  receive_packet_type_columns.push(x_axis_row);
  resent_fragments_columns.push(x_axis_row);
  resent_non_fragments_columns.push(x_axis_row);
  resent_packets_columns.push(x_axis_row);
  sent_bytes_columns.push(x_axis_row);
  sent_packet_type_columns.push(x_axis_row);

  const packet_groups = require('../../../app/config/packet-types.js');

  /**
   * Sent Packet Types
   */
  for (let packet_type in netstatListener.sent_packet_types_series_data[port]) {
    let chart_data_row = [packet_type];
    for (let time = min_seconds; time <= unix_time; time++) {
      let value = (
        typeof netstatListener.sent_packet_types_series_data[port][packet_type][time] !== "undefined" ?
          netstatListener.sent_packet_types_series_data[port][packet_type][time] :
          null
      );
      chart_data_row.push(value);
    }
    sent_packet_type_columns.push(chart_data_row);
  }

  /**
   * Receive Packet Types
   */
  for (let packet_type in netstatListener.receive_packet_types_series_data[port]) {
    let chart_data_row = [packet_type];
    for (let time = min_seconds; time <= unix_time; time++) {
      let value = (
        typeof netstatListener.receive_packet_types_series_data[port][packet_type][time] !== "undefined" ?
          netstatListener.receive_packet_types_series_data[port][packet_type][time] :
          null
      );
      chart_data_row.push(value);
    }
    receive_packet_type_columns.push(chart_data_row);
  }

  /**
   * Ping
   */
  stat = "last_ping";
  clients = [];
  for (let client_name in netstatListener.stat_series_data[port]) {
    let chart_data_row = [client_name];

    clients.push(client_name);

    for (let time = min_seconds; time <= unix_time; time++) {
      let value = (
        typeof netstatListener.stat_series_data[port][client_name][stat][time] !== "undefined" ?
          netstatListener.stat_series_data[port][client_name][stat][time] :
          null
      );
      chart_data_row.push(value);
    }
    ping_columns.push(chart_data_row);
  }

  /**
   * Packet Loss Inbound
   */
  stat = "packet_loss_in";
  clients = [];
  for (let client_name in netstatListener.stat_series_data[port]) {
    let chart_data_row = [client_name];

    clients.push(client_name);

    for (let time = min_seconds; time <= unix_time; time++) {
      let value = (
        typeof netstatListener.stat_series_data[port][client_name][stat][time] !== "undefined" ?
          netstatListener.stat_series_data[port][client_name][stat][time] :
          null
      );
      chart_data_row.push(parseFloat(value).toFixed(2));
    }
    packet_loss_inbound_columns.push(chart_data_row);
  }

  /**
   * Packet Loss Outbound
   */
  stat = "packet_loss_out";
  clients = [];
  for (let client_name in netstatListener.stat_series_data[port]) {
    let chart_data_row = [client_name];

    clients.push(client_name);

    for (let time = min_seconds; time <= unix_time; time++) {
      let value = (
        typeof netstatListener.stat_series_data[port][client_name][stat][time] !== "undefined" ?
          netstatListener.stat_series_data[port][client_name][stat][time] :
          null
      );
      chart_data_row.push(parseFloat(value).toFixed(2));
    }
    packet_loss_outbound_columns.push(chart_data_row);
  }

  /**
   * Receive Bytes
   */
  stat = "receive_bytes";
  clients = [];
  for (let client_name in netstatListener.stat_series_data[port]) {
    let chart_data_row = [client_name];

    clients.push(client_name);

    for (let time = min_seconds; time <= unix_time; time++) {
      let value = (
        typeof netstatListener.stat_series_data[port][client_name][stat][time] !== "undefined" ?
          netstatListener.stat_series_data[port][client_name][stat][time] :
          null
      );
      chart_data_row.push(parseFloat(value / 1024 / 1024).toFixed(2));
    }
    receive_bytes_columns.push(chart_data_row);
  }

  /**
   * Send Bytes
   */
  stat = "sent_bytes";
  clients = [];
  for (let client_name in netstatListener.stat_series_data[port]) {
    let chart_data_row = [client_name];

    clients.push(client_name);

    for (let time = min_seconds; time <= unix_time; time++) {
      let value = (
        typeof netstatListener.stat_series_data[port][client_name][stat][time] !== "undefined" ?
          netstatListener.stat_series_data[port][client_name][stat][time] :
          null
      );
      chart_data_row.push(parseFloat((value / 1024 / 1024)).toFixed(2));
    }
    sent_bytes_columns.push(chart_data_row);
  }

  /**
   * Resent Packets
   */
  stat = "resent_packets";
  clients = [];
  for (let client_name in netstatListener.stat_series_data[port]) {
    let chart_data_row = [client_name];

    clients.push(client_name);

    for (let time = min_seconds; time <= unix_time; time++) {
      let value = (
        typeof netstatListener.stat_series_data[port][client_name][stat][time] !== "undefined" ?
          netstatListener.stat_series_data[port][client_name][stat][time] :
          null
      );
      chart_data_row.push(value);
    }
    resent_packets_columns.push(chart_data_row);
  }

  /**
   * Resent fragments
   */
  stat = "resent_fragments";
  clients = [];
  for (let client_name in netstatListener.stat_series_data[port]) {
    let chart_data_row = [client_name];

    clients.push(client_name);

    for (let time = min_seconds; time <= unix_time; time++) {
      let value = (
        typeof netstatListener.stat_series_data[port][client_name][stat][time] !== "undefined" ?
          netstatListener.stat_series_data[port][client_name][stat][time] :
          null
      );
      chart_data_row.push(value);
    }
    resent_fragments_columns.push(chart_data_row);
  }

  /**
   * Resent non-fragments
   */
  stat = "resent_non_fragments";
  clients = [];
  for (let client_name in netstatListener.stat_series_data[port]) {
    let chart_data_row = [client_name];

    clients.push(client_name);

    for (let time = min_seconds; time <= unix_time; time++) {
      let value = (
        typeof netstatListener.stat_series_data[port][client_name][stat][time] !== "undefined" ?
          netstatListener.stat_series_data[port][client_name][stat][time] :
          null
      );
      chart_data_row.push(value);
    }
    resent_non_fragments_columns.push(chart_data_row);
  }

  /**
   * Chart data to be returned
   */
  const payload = {
    "sent_packet_types": {
      columns: sent_packet_type_columns,
      groups: [packet_groups],
      x: 'x',
      xFormat: '%H:%M:%S',
      type: 'bar',
    },
    "receive_packet_types": {
      columns: receive_packet_type_columns,
      groups: [packet_groups],
      x: 'x',
      xFormat: '%H:%M:%S',
      type: 'bar',
    },
    "ping": {
      columns: ping_columns,
      x: 'x',
      xFormat: '%H:%M:%S',
      type: 'line',
    },
    "packet_loss_inbound": {
      columns: packet_loss_inbound_columns,
      x: 'x',
      xFormat: '%H:%M:%S',
      type: 'line',
    },
    "packet_loss_outbound": {
      columns: packet_loss_outbound_columns,
      x: 'x',
      xFormat: '%H:%M:%S',
      type: 'line',
    },
    "receive_bytes": {
      columns: receive_bytes_columns,
      groups: [clients],
      x: 'x',
      xFormat: '%H:%M:%S',
      type: 'line',
    },
    "sent_bytes": {
      columns: sent_bytes_columns,
      groups: [clients],
      x: 'x',
      xFormat: '%H:%M:%S',
      type: 'line',
    },
    "resent_packets": {
      columns: resent_packets_columns,
      x: 'x',
      xFormat: '%H:%M:%S',
      type: 'line',
    },
    "resent_fragments": {
      columns: resent_fragments_columns,
      x: 'x',
      xFormat: '%H:%M:%S',
      type: 'line',
    },
    "resent_non_fragments": {
      columns: resent_non_fragments_columns,
      x: 'x',
      xFormat: '%H:%M:%S',
      type: 'line',
    },
  };

  res.setHeader('Content-Type', 'application/json');
  res.send(payload);
});

module.exports = router;