const passport = require('passport');
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const User = require('../models/User');
const cookieExtractor = function(req) {
    let token = null;
    if (req && req.cookies) {
        token = req.cookies['jwt'];
    }
    return token;
};

const opts = {
  jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor, ExtractJwt.fromAuthHeaderAsBearerToken()]),
  secretOrKey: 'mk',
};

passport.use(
  new JwtStrategy(opts, async (jwt_payload, done) => {
    try {
      const user = await User.findById(jwt_payload.id).populate("classes").lean();
      if (user) {
        return done(null, user);
      } else {
        return done(null, false);
      }
    } catch (err) {
      return done(err, false);
    }
  })
);

module.exports = passport;
