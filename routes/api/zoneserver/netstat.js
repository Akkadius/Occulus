/**
 * test.js
 * @type {createApplication}
 */
let express         = require('express');
let router          = express.Router();
let moment          = require('moment');
let netstatListener = require('../../../app/core/netstat-listener');

router.get('/:port/chart/packet_types_sent', function (req, res, next) {
  const unix_time   = Math.floor(new Date() / 1000);
  const min_seconds = (unix_time - netstatListener.max_series_store_time);
  const port        = req.params.port;

  /**
   * Add our listener
   */
  netstatListener.addListener(port);

  let chart_columns = [];

  /**
   * Set Chart X axis data (Time)
   * @type {string[]}
   */
  let x_axis_row = ['x'];
  for (let time = min_seconds; time <= unix_time; time++) {
    x_axis_row.push(moment.unix(time).format("HH:mm:ss"));
  }
  chart_columns.push(x_axis_row);

  /**
   * Chart data needs to line up 1:1 with the timestamps set above
   *
   * Loop through sent packet series
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

    chart_columns.push(chart_data_row);
  }

  packet_groups = require('../../../app/config/packet-types.js');

  /**
   * Chart data to be returned
   * @type {{columns: Array, line: {connectNull: boolean}, x: string, groups: Array[], type: string, xFormat: string, order: string}}
   */
  let chart_data = {
    columns: chart_columns,
    groups: [packet_groups],
    x: 'x',
    xFormat: '%H:%M:%S',
    type: 'bar',
  };

  res.setHeader('Content-Type', 'application/json');
  res.send(chart_data);
});

router.get('/:port/chart/packet_types_receive', function (req, res, next) {
  const unix_time   = Math.floor(new Date() / 1000);
  const min_seconds = (unix_time - netstatListener.max_series_store_time);
  const port        = req.params.port;

  /**
   * Add our listener
   */
  netstatListener.addListener(port);

  let chart_columns = [];

  /**
   * Set Chart X axis data (Time)
   * @type {string[]}
   */
  let x_axis_row = ['x'];
  for (let time = min_seconds; time <= unix_time; time++) {
    x_axis_row.push(moment.unix(time).format("HH:mm:ss"));
  }
  chart_columns.push(x_axis_row);

  /**
   * Chart data needs to line up 1:1 with the timestamps set above
   *
   * Loop through sent packet series
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

    chart_columns.push(chart_data_row);
  }

  packet_groups = require('../../../app/config/packet-types.js');

  /**
   * Chart data to be returned
   * @type {{columns: Array, line: {connectNull: boolean}, x: string, groups: Array[], type: string, xFormat: string, order: string}}
   */
  let chart_data = {
    columns: chart_columns,
    groups: [packet_groups],
    x: 'x',
    xFormat: '%H:%M:%S',
    type: 'bar',
  };

  res.setHeader('Content-Type', 'application/json');
  res.send(chart_data);
});

module.exports = router;