/**
 * app.js
 * @type {createApplication}
 */
var express      = require('express');
var path         = require('path');
var cookieParser = require('cookie-parser');
var logger       = require('morgan');
var app          = express();
var fs           = require('fs');

/**
 * Load Config
 */
eqemu_config = {};
config_path = '../eqemu_config.json';
if (fs.existsSync(config_path)) {
  eqemu_config = JSON.parse(fs.readFileSync(config_path, 'utf8'));
}

/**
 * Express
 */
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

/**
 * Sessions
 */
session = require('express-session')
app.use(
  session(
    {
      name: 'session',
      secret: 'mX6s196lLJQdxJ1I7xZk',
      resave: false,
      saveUninitialized: false,

      /**
       * 30 days
       *
       * 1 minute * 60 minutes * 24 hours * 30 days
       */
      cookie: {
        maxAge: 60000 * 60 * 24 * 30
      }
    }
  )
);

app.use(function printSession(req, res, next) {
  console.log('req.session', req.session);
  return next();
});

/**
 * Routes
 */
app.use('/', require('./routes/index'));
app.use('/users', require('./routes/users'));

/**
 * Login
 */
app.use('/login', require('./routes/auth/login'));
app.use('/logout', require('./routes/auth/logout'));

/**
 * API Routes
 */
app.use('/api/dashboard/stats', require('./routes/api/dashboard/stats'));

module.exports = app;

/**
 * Load Database
 */
const database  = eqemu_config.server.database;
const Sequelize = require('sequelize');
const db        = new Sequelize(
  database.db,
  database.username,
  database.password, {
    host: database.host,
    dialect: 'mysql',
  }
);

/**
 * Connect to DB
 */
db.authenticate()
  .then(() => {
      console.log('MySQL Connection has been established successfully.');
    }
  )
  .catch(err => {
      console.error('Unable to connect to the database:', err);
    }
  );

/**
 * Dynamically load models
 * @type {{}}
 */
models = {};
fs.readdirSync('models/').forEach(function (filename) {
  var model          = {};
  model.path         = path.join(__dirname, 'models/', filename)
  model.name         = filename.replace(/\.[^/.]+$/, "");
  model.resource     = db.import(model.path);
  models[model.name] = model;
});
