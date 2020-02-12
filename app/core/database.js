/**
 * database.js
 * @type {{exec: module.exports.exec}}
 */
const fs                 = require('fs')
const pathManager        = require('./path-manager')
const eqemuConfigService = require('./eqemu-config-service')
const Sequelize          = require('sequelize')
const path               = require('path')

module.exports = {

  connection: null,

  /**
   * @return {boolean}
   */
  init: async function () {
    if (this.connection !== null) {
      return false;
    }

    const database  = eqemuConfigService.getServerConfig().server.database;
    this.connection = new Sequelize(
      database.db,
      database.username,
      database.password, {
        host: database.host,
        dialect: 'mysql',
        logging: false,
        operatorsAliases: false
      }
    );

    /**
     * Connect to DB
     */
    this.connection.authenticate()
      .then(() => {
          console.log('[database] MySQL Connection has been established successfully');

          /**
           * Load models
           * @type {{}}
           */
          global.models = {};
          let self = this;
          fs.readdirSync(pathManager.appRoot + '/app/models/').forEach(function (filename) {
            var model                 = {};
            model.path                = path.join(pathManager.appRoot, '/app/models/', filename)
            model.name                = filename.replace(/\.[^/.]+$/, '');
            model.resource            = self.connection.import(model.path);
            global.models[model.name] = model;
          });
        }
      )
      .catch(err => {
          console.error('Unable to connect to the database:', err);
        }
      );
  }
};
