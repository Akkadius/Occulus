var express      = require('express');
var path         = require('path');
var cookieParser = require('cookie-parser');
var logger       = require('morgan');
var app          = express();
var fs           = require('fs');

/**
 * Express
 */
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', require('./routes/index'));
app.use('/users', require('./routes/users'));
app.use('/dashboard/stats', require('./routes/dashboard/stats'));

module.exports = app;

/**
 * Load Config
 */
var eqemu_config = JSON.parse(fs.readFileSync('../eqemu_config.json', 'utf8'));

console.log(eqemu_config.server.database);
const database = eqemu_config.server.database;

const Sequelize = require('sequelize');
const db        = new Sequelize(
  database.db,
  database.username,
  database.password, {
    host: database.host,
    dialect: 'mysql',
  }
);

db
  .authenticate()
  .then(() => {
    console.log('MySQL Connection has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

models = {};
fs.readdirSync('models/').forEach(function (filename) {
  var model          = {};
  model.path         = path.join(__dirname, 'models/', filename)
  model.name         = filename.replace(/\.[^/.]+$/, "");
  model.resource     = db.import(model.path);
  models[model.name] = model;
});

console.log(models);

models['account'].resource.count().then(c => {
  console.log("There are " + c + " accounts!")
})
