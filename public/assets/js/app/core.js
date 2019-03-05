/**
 * core.js
 */

require(['jquery', 'bootstrap'], function ($) {

  $(document).ready(function () {

    /**
     * API: Stats
     */
    $.get("/dashboard/stats", function (data) {

      /**
       * Draw stats to page
       */
      $('.characters').html(kFormatter(data.characters));
      $('.accounts').html(kFormatter(data.accounts));
      $('.guilds').html(kFormatter(data.guilds));
      $('.items').html(kFormatter(data.items));
      $('.zones').html(kFormatter(data.zone_count));
      $('.server-longname').html(data.long_name);
      $('.server-uptime').html(data.uptime);

      /**
       * Update page title
       * @type {string}
       */
      document.title = document.title + " " + data.long_name;

      // modal("test", "test");
    });
  });

  /**
   * modal("Test Title", "Test Body");
   * @param title
   * @param body
   * @param footer
   */
  function modal(title, body, footer = null) {
    if (title) {
      $("#app-modal-title").html(title);
    }

    if (body) {
      $("#app-modal-body").html(body);
    }

    if (footer) {
      $("#app-modal-footer").html(footer);
    }

    $("#app-modal").modal('show');
  }

  /**
   * @param x
   * @returns {string}
   */
  function commify(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  /**
   * @param num
   * @returns {string}
   */
  function kFormatter(num) {
    return num > 999 ? (num / 1000).toFixed(1) + 'k' : num
  }
});