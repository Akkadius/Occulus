/**
 * @type {{check: module.exports.check}}
 */
module.exports = {
  createModel : function (table) {

    if (!table) {
      console.log('Table name must be specified');
      process.exit();
    }

    const sequelize_auto = require('sequelize-auto');

    /**
     * Load Config
     */
    let fs           = require('fs');
    let eqemu_config = JSON.parse(fs.readFileSync('../eqemu_config.json', 'utf8'));
    const database   = eqemu_config.server.database;

    /**
     * Sequelize
     * @type {AutoSequelize}
     */
    let auto = new sequelize_auto(
      database.db,
      database.username,
      database.password, {
        host : database.host,
        dialect : 'mysql',
        directory : 'app/models/', // prevents the program from writing to disk
        port : '3306',

        additional : {
          timestamps : false,
          freezeTableName : true,
        },
        tables : [table]
      }
    );

    auto.run(function (err) {
      if (err) throw err;

      console.log(auto.tables); // table list
      console.log(auto.foreignKeys); // foreign key list

      console.log('Model created from \'%s\'', table);
    });
  },
};
