/**
 * auth-service.js
 * @type {module:fs}
 */

const pathManager = require('./path-manager')
const fs          = require('fs');
const path        = require('path')
const jwt         = require('jsonwebtoken');

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

    // authService.isTokenValid(token)

    if (req.session.loggedIn) {
      return next();
    } else {
      res.redirect('/login');
    }
  },

  /**
   * init key
   * @returns {exports}
   */
  initializeKey : function () {
    const keyFile = path.join(pathManager.appRoot, 'app-key');
    const uuidv4  = require('uuid/v4');

    if (!fs.existsSync(keyFile)) {
      this.appKey = uuidv4();
      fs.writeFileSync(keyFile, this.appKey);
      console.log('Initializing app-key \'%s\' to \'%s\'', this.appKey, keyFile)
    } else {
      this.appKey = fs.readFileSync(keyFile);
      console.log('Loaded app-key \'%s\' via \'%s\'', this.appKey, keyFile)
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
      console.log('Verify \'%s\'', token)
      console.log('AppKey \'%s\'', this.appKey)

      const validation = jwt.verify(token, this.appKey);
      this.user        = validation.user;
      this.userToken   = token;

      return validation;
    } catch (err) {
      console.debug('[%s][%s] Error Type: "%s: %s"', __filename, 'isTokenValid', err.name, err.message)
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
      console.log('requested url \'%s\'', requestedUrl)

      let accessToken = '';
      if (req.get('authorization')) {
        try {
          accessToken = req.get('authorization').split('Bearer ')[1].trim();
        } catch (e) {
          console.log('Authorization token is invalid')
          res.send(401, 'Authorization token is invalid');
        }
        console.debug('[auth] access token is \'%s\'', accessToken);
      }

      if (requestedUrl.includes('/api/v1/auth/')) {
        console.debug('[auth-route] \'%s\'', requestedUrl)
        next();
      } else if (requestedUrl.includes('/api/v1/')) {
        console.debug('[v1-route] \'%s\'', requestedUrl);

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
