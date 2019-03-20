/**
 * template-render.js
 * @type {module:fs}
 */
let fs  = require('fs');
let ejs = require('ejs');

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

    /**
     * Vanilla .html
     */
    if (fs.existsSync('./app/templates/' + template + '.html')) {
      this.template = fs.readFileSync(
        './app/templates/' + template + '.html',
        'utf8'
      );

      return this;
    }

    /**
     * EJS
     */
    if (fs.existsSync('./app/templates/' + template + '.ejs')) {
      this.template = fs.readFileSync(
        './app/templates/' + template + '.ejs',
        'utf8'
      );

      return this;
    }

    return null;
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

  /**
   * @param data
   * @param options
   * @returns {String|Promise<String>}
   */
  renderEjs: function (data, options) {
    return ejs.render(this.template, data, options);
  },
};