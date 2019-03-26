// localStorage.setItem("lastname", "Smith")
// localStorage.getItem("lastname");

if (typeof (Storage) !== "undefined") {
  loadDarkMode();
} else {
  // Sorry! No Web Storage support..
}

$("body").css("cssText", "background-color: #040404 !important; filter: invert(100%)");
$("img, .avatar").css("filter", "invert(100%)");

function toggleDarkMode() {
  var darkMode = localStorage.getItem("dark_mode");
  if (typeof darkMode !== "undefined" && darkMode === "1") {
    setLightMode();
    localStorage.setItem("dark_mode", "0");
    // console.log("Dark mode is now %s", localStorage.getItem("dark_mode"));
    return false;
  }

  setDarkMode();

  $("style[dark-mode]")
    .html("body { filter: invert(100%); background-color: #040404 !important; }" +
      "img, .avatar { filter: invert(100%); }");

  localStorage.setItem("dark_mode", "1");

  // console.log("Dark mode is now %s", localStorage.getItem("dark_mode"));
}

function loadDarkMode() {
  var darkMode = localStorage.getItem("dark_mode");
  if (typeof darkMode !== "undefined" && darkMode === "1") {
    setDarkMode();
    return false;
  }
  setLightMode();
}

function setDarkMode() {
  $("style[dark-mode]")
    .html("body { filter: invert(100%); background-color: #040404 !important; }" +
      "img, .avatar { filter: invert(100%); }");
}

function setLightMode() {
  $("style[dark-mode]")
    .html("body { filter: invert(0%); background-color: #f5f7fb !important; }" +
      "img, .avatar { filter: invert(0%); }");
}

function checkLightModeToggleInput() {
  var darkMode = localStorage.getItem("dark_mode");
  // console.log("dark mode is %s", darkMode);
  if (typeof darkMode !== "undefined" && darkMode === "1") {
    $(".night-mode-toggle").prop("checked", true);
    return false;
  }
}

$(document).ready(function() {
  checkLightModeToggleInput();
  $(".custom-switch").fadeIn(200);
});
