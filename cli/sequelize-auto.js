var SequelizeAuto = require('sequelize-auto')

/**
 * Load Config
 */
var fs           = require('fs');
var eqemu_config = JSON.parse(fs.readFileSync('../eqemu_config.json', 'utf8'));

console.log(eqemu_config.server.database);
const database = eqemu_config.server.database;

var auto = new SequelizeAuto(
  database.db,
  database.username,
  database.password, {
    host: database.host,
    dialect: 'mysql',
    directory: "models/", // prevents the program from writing to disk
    port: '3306',

    additional: {
      timestamps: false,
      freezeTableName: true,
    },
    tables: [
      'account',
      'character_data',
      'items'
    ]
    //...
  }
);

auto.run(function (err) {
  if (err) throw err;

  console.log(auto.tables); // table list
  console.log(auto.foreignKeys); // foreign key list
});