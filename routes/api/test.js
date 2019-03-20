/**
 * test.js
 * @type {createApplication}
 */
let express = require('express');
let router  = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  // console.log(global.time_series_data);

  const unix_time = Math.floor(new Date() / 1000);
  const min_seconds = (unix_time - max_seconds_series_store);

  let response_data = [];

  for (time = min_seconds; time <= unix_time; time++) {
    if (time_series_data[time]) {
      console.log(time_series_data[time]['sent_packet_types']);

      for (let packet_type in time_series_data[time]['sent_packet_types']) {
        const value = time_series_data[time]['sent_packet_types'][packet_type];
        response_data.push(
          {
            "time": time,
            "packet": packet_type,
            "delta": value
          }
        );
      }
      // response_data = time_series_data[i]['sent_packet_types'];
    }
  }

  res.setHeader('Content-Type', 'application/json');
  res.send(response_data);
});

module.exports = router;