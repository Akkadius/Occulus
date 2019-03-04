/**
 * template-render.js
 * @type {module:fs}
 */
var fs = require('fs');

/**
 * @type {{getTemplate: (function(*): string), setVar: (function(*, *, *=): (void | string | never))}}
 */
module.exports = {

  /**
   * @param template
   * @returns {string}
   */
  getTemplate: function (template) {
    return fs.readFileSync('./app/templates/' + template + '.html', 'utf8');
  },

  /**
   * @param template
   * @param variable
   * @param value
   * @returns {void | string | never}
   */
  setVar: function (template, variable, value) {
    return template.replace("{{" + variable + "}}", value);
  },
};