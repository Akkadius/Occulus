/**
 * app.js
 * @type {createApplication}
 */
let express      = require('express');
let cookieParser = require('cookie-parser');
let logger       = require('morgan');
let app          = express();
let fs           = require('fs');
let path         = require('path')

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
global.base_server_path = path.join(__dirname, '../');
global.app_root = path.resolve(__dirname).split('/node_modules')[0];

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

console.log("app root is '%s'", app_root);

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
 * API
 */
app.use('/api/dashboard/stats', require('./routes/api/dashboard/stats'));
app.use('/api/world/servers', require('./routes/api/world/servers'));
app.use('/api/zoneserver', require('./routes/api/zoneserver'));
app.use('/api/zoneserver/netstat', require('./routes/api/zoneserver/netstat'));
app.use('/api/server', require('./routes/api/server'));

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
fs.readdirSync(app_root + '/models/').forEach(function (filename) {
  var model          = {};
  model.path         = path.join(app_root, '/models/', filename)
  model.name         = filename.replace(/\.[^/.]+$/, "");
  model.resource     = db.import(model.path);
  models[model.name] = model;
});

/**
 * NetStat Listeners
 */
const netstatListener = require('./app/core/netstat-listener');

setInterval(function () {
  netstatListener.prune();
  netstatListener.listen();
}, 1000);
