/**
 * app.js
 * @type {createApplication}
 */
const express            = require('express');
const cookieParser       = require('cookie-parser');
const logger             = require('morgan');
const app                = express();
const fs                 = require('fs');
const path               = require('path')
const pathManager        = require('./app/core/path-manager')
const eqemuConfigService = require('./app/core/eqemu-config-service')
const authService        = require('./app/core/auth-service')

/**
 * Init services
 */
pathManager.init(__dirname);
eqemuConfigService.init();
authService.initializeAppKey();
authService.initializeAdminPasswordIfNotSet();

/**
 * Express
 */
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());

/**
 * For Development
 * @type {any}
 */
var cors = require('cors')
app.use(
  cors(
    {
      origin: [
        'http://localhost:8080',
        'http://docker:8080',
        'http://localhost:5000'
      ],
      exposedHeaders: ['Content-Disposition']
    }
  )
);

app.use(authService.handleApiRoutes());

/**
 * Routes
 */
app.use('/download', require('./app/routes/download'));

/**
 * API
 */
app.use('/api/v1/dashboard/stats', require('./app/routes/api/dashboard/stats'));
app.use('/api/v1/world/', require('./app/routes/api/world/world'));
app.use('/api/v1/zoneserver', require('./app/routes/api/zoneserver'));
app.use('/api/v1/zoneserver/netstat', require('./app/routes/api/zoneserver/netstat'));
app.use('/api/v1/server', require('./app/routes/api/server'));
app.use('/api/v1/auth', require('./app/routes/api/auth/auth'));
app.use('/api/v1/admin', require('./app/routes/api/admin'));
app.use('/api/v1/backup', require('./app/routes/api/backup/backup'));

/**
 * Serve Vue SPA
 */
app.use(express.static(path.join(__dirname, 'public'), { maxAge: '1y', etag: false }))

/**
 * After other routes are not found
 */
app.get('*', function (req, res, next) {
  res.sendFile(path.join(__dirname, 'public/index.html'))
})

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
    operatorsAliases: false
  },
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
