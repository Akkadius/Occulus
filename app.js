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
var path         = require('path')
/**
 * Load Config
 */
eqemu_config = {};
config_path = '../eqemu_config.json';
if (fs.existsSync(config_path)) {
  eqemu_config = JSON.parse(fs.readFileSync(config_path, 'utf8'));
}

/**
 * Base server path
 */
base_server_path = path.join(__dirname, '../');

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

/**
 * Print session debug
 */
app.use(function printSession(req, res, next) {
  // console.log('req.session', req.session);
  return next();
});

/**
 * Routes
 */
app.use('/', require('./routes/index'));
app.use('/zoneservers', require('./routes/zoneservers'));
app.use('/zoneserver', require('./routes/zoneserver/netstats'));
app.use('/download', require('./routes/download'));

/**
 * Login
 */
app.use('/login', require('./routes/auth/login'));
app.use('/logout', require('./routes/auth/logout'));

/**
 * API Routes
 */
app.use('/api/dashboard/stats', require('./routes/api/dashboard/stats'));
app.use('/api/world/servers', require('./routes/api/world/servers'));
app.use('/api/zoneserver', require('./routes/api/zoneserver'));
app.use('/api/test', require('./routes/api/test'));

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

/**
 * NetStat Listeners
 */
global.last_analyzed_data = {};
global.sent_packet_series_data  = {};
global.max_seconds_series_store = 300;

setInterval(function () {
  require('./app/core/netstat-listener').listen();
}, 1000);