/**
 * helper-functions.js
 * @type {{sleep: (function(*=): Promise<any>)}}
 */
module.exports = {
  sleep : function (ms) {
    return new Promise(resolve => {
      setTimeout(resolve, ms)
    });
  },
  log : function(message) {
    console.log("   |> %s", message);
  },
};