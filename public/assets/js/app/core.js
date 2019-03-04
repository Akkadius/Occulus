require(['jquery'], function ($) {
  $(document).ready(function () {
    $.get("/dashboard/stats", function (data) {
      $('.characters').html(kFormatter(data.characters));
      $('.accounts').html(kFormatter(data.accounts));
      $('.guilds').html(kFormatter(data.guilds));
      $('.items').html(kFormatter(data.items));
      $('.zones').html(kFormatter(data.zone_count));
      $('.server-longname').html(data.long_name);
      $('.server-uptime').html(data.uptime);
      document.title = document.title + " " + data.long_name;
      //console.log(data);
    });
  });

  function commify(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  function kFormatter(num) {
    return num > 999 ? (num / 1000).toFixed(1) + 'k' : num
  }
});