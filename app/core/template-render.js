/**
 * template-render.js
 * @type {module:fs}
 */
let fs = require('fs');

/**
 * @type {{template: null, getTemplate: (function(*): exports), var: (function(*, *=): exports)}}
 */
module.exports = {

  /**
   * @string
   */
  template: null,

  /**
   * @param template
   * @returns {exports}
   */
  load: function (template) {
    this.template = fs.readFileSync(
      './app/templates/' + template + '.html',
      'utf8'
    );

    return this;
  },

  /**
   * @param variable
   * @param value
   * @returns {exports}
   */
  var: function (variable, value) {
    this.template = this.template.replace("{{" + variable + "}}", value);

    return this;
  },

  /**
   * @returns {null}
   */
  render: function () {
    return this.template;
  },
};