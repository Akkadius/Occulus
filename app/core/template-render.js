/**
 * template-render.js
 * @type {module:fs}
 */
const fs          = require('fs');
const ejs         = require('ejs');
const pathManager = require('./path-manager');

/**
 * @type {{template: null, getTemplate: (function(*): exports), var: (function(*, *=): exports)}}
 */
module.exports = {

  /**
   * @string
   */
  template : null,

  /**
   * @param template
   * @returns {exports}
   */
  load : function (template) {

    /**
     * Vanilla .html
     */
    if (fs.existsSync(pathManager.appRoot + '/app/templates/' + template + '.html')) {
      this.template = fs.readFileSync(
        pathManager.appRoot + '/app/templates/' + template + '.html',
        'utf8'
      );

      return this;
    }

    /**
     * EJS
     */
    if (fs.existsSync(pathManager.appRoot + '/app/templates/' + template + '.ejs')) {
      this.template = fs.readFileSync(
        pathManager.appRoot + '/app/templates/' + template + '.ejs',
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
  var : function (variable, value) {
    this.template = this.template.replace("{{" + variable + "}}", value);

    return this;
  },

  /**
   * @returns {null}
   */
  render : function () {
    return this.template;
  },

  /**
   * @param data
   * @param options
   * @returns {String|Promise<String>}
   */
  renderEjs : function (data, options) {
    if (!options) {
      options = { root : pathManager.appRoot + "/app/templates/" };
    }

    return ejs.render(this.template, data, options);
  },
};