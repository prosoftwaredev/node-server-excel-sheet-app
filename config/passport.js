const LocalStrategy = require('passport-local').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const bcrypt = require('bcrypt');
const config = require('../config');
const db = require('./db');

const localOptions = {
  usernameField: 'email_address'
};

const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeader(),
  secretOrKey: config.secret
};
// TODO: setup secret

module.exports = function (passport) {

  passport.use('local', new LocalStrategy(localOptions,
    function (username, password, done) {

      return db.connection.any("SELECT * FROM users WHERE email_address = '" + username + "'")
        .then(function (rows, err) {

          if (err) {
            return done(err);
          }

          if (rows.length != 1) {
            return done(null, false, { message: 'No users found.' });
          }

          let user = rows[0];

          return bcrypt.compare(password, user.encrypted_password, function (err, match) {
            if (!match) {

              return done(null, false, { message: 'Incorrect password.' });

            } else {

              return checkAccountStatus(user, done);

            }
          });

        })
        .catch(function (err) {
          console.log(err);
          return done(err);
        });
    }
  ));

  passport.use('user-local', new LocalStrategy(localOptions,
    function (username, password, done) {

      return db.connection.any("SELECT * FROM users WHERE is_admin = false AND email_address = '" + username + "'")
        .then(function (rows, err) {

          if (err) {
            return done(err);
          }

          if (rows.length != 1) {
            return done(null, false, { message: 'No users found.' });
          }

          let user = rows[0];

          return bcrypt.compare(password, user.encrypted_password, function (err, match) {
            if (!match) {

              return done(null, false, { message: 'Incorrect password.' });

            } else {

              return checkAccountStatus(user, done);

            }
          });

        })
        .catch(function (err) {
          console.log(err);
          return done(err);
        });
    }
  ));

  passport.use('admin-local', new LocalStrategy(localOptions,
    function (username, password, done) {

      return db.connection.any("SELECT * FROM users WHERE is_admin = true AND email_address = '" + username + "'")
        .then(function (rows, err) {

          if (err) {
            return done(err);
          }

          if (rows.length != 1) {
            return done(null, false, { message: 'No admins found.' });
          }

          let user = rows[0];

          return bcrypt.compare(password, user.encrypted_password, function (err, match) {
            if (!match) {

              return done(null, false, { message: 'Incorrect password.' });

            } else {

              return checkAccountStatus(user, done);

            }
          });

        })
        .catch(function (err) {
          console.log(err);
          return done(err);
        });
    }
  ));

  passport.use('jwt', new JwtStrategy(jwtOptions,
    function (decodedToken, done) {
      return db.connection.any("SELECT * FROM users WHERE id = '" + decodedToken.id + "'")
        .then(function (rows, err) {

          if (err) { return done(err, false); }

          if (rows.length != 1) {
            return done(null, false, { message: 'No users found.' });
          }

          let user = rows[0];

          if (user) {
            return checkAccountStatus(user, done);
          } else {
            return done(null, false);
          }
        })
        .catch(function (err) {
          return done(err);
        });
    }
  ));

  passport.use('user-jwt', new JwtStrategy(jwtOptions,
    function (decodedToken, done) {
      return db.connection.any("SELECT * FROM users WHERE is_admin = false AND id = '" + decodedToken.id + "'")
        .then(function (rows, err) {

          if (err) { return done(err, false); }

          if (rows.length != 1) {
            return done(null, false, { message: 'No users found.' });
          }

          let user = rows[0];

          if (user) {
            return checkAccountStatus(user, done);
          } else {
            return done(null, false);
          }
        })
        .catch(function (err) {
          return done(err);
        });
    }
  ));

  passport.use('admin-jwt', new JwtStrategy(jwtOptions,
    function (decodedToken, done) {
      return db.connection.any("SELECT * FROM users WHERE is_admin = true AND id = '" + decodedToken.id + "'")
        .then(function (rows, err) {

          if (err) { return done(err, false); }

          if (rows.length != 1) {
            return done(null, false, { message: 'No admins found.' });
          }

          let user = rows[0];

          if (user) {
            return checkAccountStatus(user, done);
          } else {
            return done(null, false);
          }
        })
        .catch(function (err) {
          return done(err);
        });
    }
  ));

  function checkAccountStatus(user, done) {
    if (user.is_disabled === false) {
      return db.getUserInfoByEmail(user.email_address)
        .then(function (safeUser) {
          return done(null, safeUser);
        });
    } else {
      return done(null, false, { message: 'Account disabled' });
    }
  }

};
