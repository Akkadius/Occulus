/**
 * auth-service.js
 * @type {module:fs}
 */

const jwt                = require('jsonwebtoken')
const eqemuConfigService = require('./eqemu-config-service')
const uuidv4             = require('uuid/v4');
const debug              = require('debug')('eqemu-admin:auth');

/**
 * @type {{check: module.exports.check}}
 */
module.exports = {
  appKey : '',
  tokenExpirationTime : 60 * 60 * 24 * 7,
  user : null,
  userToken : null,

  /**
   * check authorization
   *
   * @param req
   * @param res
   * @param next
   * @returns {*}
   */
  check : function (req, res, next) {
    if (req.session.loggedIn) {
      return next();
    } else {
      res.redirect('/login');
    }
  },

  /**
   * Load or set key
   *
   * @returns {exports}
   */
  initializeAppKey : function () {
    this.appKey = eqemuConfigService.getAdminPanelConfig('application.key');
    if (!this.appKey) {
      this.appKey = uuidv4();
      eqemuConfigService.setAdminPanelConfig('application.key', this.appKey);
      eqemuConfigService.saveServerConfig();
    }

    return this;
  },

  /**
   * @param length
   * @returns {string}
   */
  genRandomString: function (length) {
    return crypto.randomBytes(Math.ceil(length / 2))
      .toString('hex') /** convert to hexadecimal format */
      .slice(0, length);   /** return required number of characters */
  },

  /**
   * Load or set key
   *
   * @returns {exports}
   */
  initializeAdminPasswordIfNotSet: function () {
    this.appKey = eqemuConfigService.getAdminPanelConfig('application.admin.password');
    if (!this.appKey) {
      eqemuConfigService.setAdminPanelConfig(
        'application.admin.password',
        this.genRandomString(30)
      );
      eqemuConfigService.saveServerConfig();
    }

    return this;
  },

  /**
   * @param username
   * @returns {Buffer | string | number | PromiseLike<ArrayBuffer>}
   */
  generateToken : function (username) {
    return jwt.sign(
      {
        exp : Math.floor(Date.now() / 1000) + this.tokenExpirationTime,
        user : username
      },
      this.appKey
    );
  },

  /**
   * @param token
   * @returns {boolean}
   */
  isTokenValid : function (token) {
    try {
      debug('[auth-service] Verify [%s]', token)
      debug('[auth-service] AppKey [%s]', this.appKey)

      const validation = jwt.verify(token, this.appKey);
      this.user        = validation.user;
      this.userToken   = token;

      return validation;
    } catch (err) {
      debug('[%s][%s] Error Type: "%s: %s"', __filename, 'isTokenValid', err.name, err.message)
      return false;
    }
  },

  handleApiRoutes : function () {
    var self = this;
    return function (req, res, next) {
      if ('OPTIONS' === req.method) {
        next();
      }

      const requestedUrl = req.originalUrl;
      debug('[auth-service] requested url [%s]', requestedUrl)

      let accessToken = '';
      if (req.get('authorization')) {
        try {
          accessToken = req.get('authorization').split('Bearer ')[1].trim();
        } catch (e) {
          debug('[auth-service] Authorization token is invalid')
          res.send(401, 'Authorization token is invalid');
        }
      }

      if (requestedUrl.includes('/api/v1/auth/')) {
        debug('[auth-route] [%s]', requestedUrl)
        next();
      } else if (requestedUrl.includes('/api/v1/')) {
        debug('[v1-route] [%s]', requestedUrl);

        if (accessToken === '') {
          res.send(401, 'Authorization token is not valid');
        }

        if (!self.isTokenValid(accessToken)) {
          res.send(401, 'Authorization token is not valid');
        } else {
          next();
        }
      } else {
        next();
      }
    };
  }
};
