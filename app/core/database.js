/**
 * database.js
 * @type {{exec: module.exports.exec}}
 */
const fs                 = require('fs')
const pathManager        = require('./path-manager')
const eqemuConfigService = require('./eqemu-config-service')
const Sequelize          = require('sequelize')
const path               = require('path')
const util               = require('util')

module.exports = {

  connection: null,
  contentConnection: null,

  /**
   * @return {boolean}
   */
  init: async function () {
    if (this.connection !== null) {
      return false;
    }

    const serverConfig = eqemuConfigService.getServerConfig().server;
    this.connection    = await this.connect(serverConfig.database);

    if (eqemuConfigService.getServerConfig().server.content_database
      && eqemuConfigService.getServerConfig().server.content_database.host
      && eqemuConfigService.getServerConfig().server.content_database.host.trim() !== "") {
      this.contentConnection = await this.connect(serverConfig.content_database, 'content');
    } else {
      this.contentConnection = this.connection;
    }
  },

  /**
   * @param eqemuDatabaseConfig
   * @param connectionType
   * @returns {Promise<void>}
   */
  async connect(eqemuDatabaseConfig, connectionType = 'default') {

    const database   = eqemuDatabaseConfig;
    const connection = new Sequelize(
      database.db,
      database.username,
      database.password, {
        host: database.host,
        port: database.port,
        dialect: 'mysql',
        logging: false
      }
    );

    /**
     * Connect to DB
     */
    const connectionProperties = util.format(
      'Host [%s:%s] Database [%s] User [%s]',
      database.host,
      database.port,
      database.db,
      database.username
    )

    console.log('[database] MySQL Attempting to connect (%s) | %s', connectionType, connectionProperties);

    try {
      await connection.authenticate();
      console.log('[database] MySQL Connected (%s) | %s', connectionType, connectionProperties);
    } catch (error) {
      console.error('Unable to connect to the database:', error);
    }

    return connection;
  },

  /**
   * @param connection
   * @param tableName
   * @returns {Promise<*>}
   */
  async tableRowCount(connection, tableName) {
    return (await
        connection.query(
          util.format(
            'select count(*) as count from %s',
            tableName
          ),
          { type: 'SELECT' }
        )
    )[0].count;
  }
}

