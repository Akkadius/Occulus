/**
 * @type {{check: module.exports.check}}
 */
module.exports = {
  check: function (req, res, next) {

    /**
     * Check against session if logged in
     */
    if (req.session.loggedIn) {
      next();
      return;
    }

    res.redirect('/login');
  },
};