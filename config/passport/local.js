var passport = require('passport');
const passportJWT = require('passport-jwt');
const ExtractJWT = passportJWT.ExtractJwt;
const JWTStrategy = passportJWT.Strategy;
var LocalStrategy = require('passport-local').Strategy;

const User = require('../../models/User');
const crypto = require('../../utils/crypto');
const ConfigKey = require('../keys');

/**
 * Setup local strategy
 */
passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    session: false,
  },
  function (email, password, done) {

    User.findOne({
      email,
    }, function (err, user) {

      if (err) return done(err);
      if (!user || crypto.decrypt(user.password) !== password) {
        return done(null, false, { message: 'Credential Error' });
      }
      return done(null, user);
    });
  }
));

passport.use(new JWTStrategy({
    jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
    secretOrKey: ConfigKey.JWTKey
  },
  function (jwtPayload, cb) {
    // find the user in db if needed
    User.findById(jwtPayload._id)
      .then(user => {
        return cb(null, user);
      })
      .catch(err => {
        return cb(err);
      });
  }
));