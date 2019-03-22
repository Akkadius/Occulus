/**
 * @type {{check: module.exports.check}}
 */
module.exports = {
  check: function (req, res, next) {

    /**
     * Check against session if logged in
     */
    if (req.session.loggedIn) {
      return next();
    }
    else {
      res.redirect('/login');
    }
  },
};