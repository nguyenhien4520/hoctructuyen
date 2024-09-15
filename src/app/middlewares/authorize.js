const passport = require('passport');

function authorize(roles = []) {
  if (typeof roles === 'string') {
    roles = [roles];
  }

  return [
    passport.authenticate('jwt', { session: false, failureRedirect: '/' }),
    (req, res, next) => {
      if (!roles.length || roles.includes(req.user.role)) {
        return next();
      }
      return res.redirect('/')
    }
  ];
}

module.exports = { authorize };
