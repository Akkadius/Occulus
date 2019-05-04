/**
 * app.js
 * @type {createApplication}
 */
let express            = require('express');
let cookieParser       = require('cookie-parser');
let logger             = require('morgan');
let app                = express();
let fs                 = require('fs');
let path               = require('path')
let pathManager        = require('./app/core/path-manager')
let eqemuConfigService = require('./app/core/eqemu-config-service')

/**
 * Init services
 */
pathManager.init(__dirname);
eqemuConfigService.init();

/**
 * Express
 */
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

/**
 * For Development
 * @type {any}
 */
var cors = require('cors')
app.use(cors())

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
app.use('/', require('./app/routes/index'));
app.use('/zoneservers', require('./app/routes/zoneservers'));
app.use('/zoneserver', require('./app/routes/zoneserver/netstats'));
app.use('/download', require('./app/routes/download'));

/**
 * API
 */
app.use('/api/dashboard/stats', require('./app/routes/api/dashboard/stats'));
app.use('/api/world/servers', require('./app/routes/api/world/servers'));
app.use('/api/zoneserver', require('./app/routes/api/zoneserver'));
app.use('/api/zoneserver/netstat', require('./app/routes/api/zoneserver/netstat'));
app.use('/api/server', require('./app/routes/api/server'));
app.use('/api/auth', require('./app/routes/api/auth/auth'));

module.exports = app;

/**
 * Load Database
 */
const database  = eqemuConfigService.getServerConfig().server.database;
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
fs.readdirSync(pathManager.appRoot + '/app/models/').forEach(function (filename) {
  var model          = {};
  model.path         = path.join(pathManager.appRoot, '/app/models/', filename)
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
