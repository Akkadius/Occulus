/**
 * core.js
 */

require(['jquery', 'bootstrap'], function ($) {

  $(document).ready(function () {

    /**
     * API: Stats
     */
    $.get("/api/dashboard/stats", function (data) {

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

    /**
     * Highlight top level nav-bar link
     *
     * Few different ways we determine matches
     *
     * 1) The navbar link is contained in the window.location.pathname
     * 2) Children attribute is contained in window.location.pathname
     * 3) Exact path match "/" == "/"
     */
    $(".nav-tabs > .nav-item > a").each(function (index) {
      if (window.location.pathname.includes($(this).attr('href')) && $(this).attr('href') !== "/") {
        $(this).addClass("active");
      } else if ($(this).attr('children-links')) {
        var links = $(this).attr("children-links").split(",");
        for (var link in links) {
          var children_link = links[link];
          if (window.location.pathname.includes(children_link)) {
            $(this).addClass("active");
          }
        }
      } else if (window.location.pathname === $(this).attr('href')) {
        $(this).addClass("active");
      }
    });

    // window.location.pathname

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