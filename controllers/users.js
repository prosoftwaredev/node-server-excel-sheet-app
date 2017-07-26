const crypto = require('crypto');
const config = require('../config');
const db = require('../config/db');
const uuid = require('uuid/v4');
const userUtils = require('../utils/user_utils.js');
const controllerUtils = require('../utils/controller_utils.js');

module.exports = {
  login: login,
  logout: logout,
  resetPassword: resetPassword,
  lookupUsers: lookupUsers,
  getUserInfo: getUserInfo,
  adminGetUserInfo: adminGetUserInfo,
  getAllUsers: getAllUsers,
  adminGetAllUsers: adminGetAllUsers,
  updateUser: updateUser,
  deleteUser: deleteUser,
  disableUser: disableUser,
  enableUser: enableUser,
  createUser: createUser,
  createAdmin: createAdmin,
  resendInvite: resendInvite,
  checkFirstPass: checkFirstPass,
};

function login(req, res) {
  console.log('req.user', req.user);
  setTokenInfo(req.user)
    .then(function (tokenObj) {
      console.log('login tokenObj', tokenObj);
      res.status(200).json({
        token: 'JWT ' + userUtils.generateToken(tokenObj),
        user: {
          user_email_address: tokenObj.user_email_address
        }
      });
    })
    .catch(function (err) {
      console.log('login err', err);
      res.status(401).json({
        error: err
      });
    });
}

function logout(req, res) {
  // TODO: invalidate active token (need a strategy for doing this w/ jwt's)
  res.status(200).json({});
}

function setTokenInfo(user) {
  console.log('set token user: ', user);
  return db.connection.any('SELECT users.id, users.email_address FROM users WHERE users.id = $1', [user.id])
    .then(function (rows) {
      console.log('set token rows: ', rows);
      let user = rows[0];
      if (user != undefined) {
        console.log('success case, user: ', user);
        return {
          id: user.id,
          user_email_address: user.email_address
        };
      //  TODO: add a uuid to the token, then specific tokens can be blacklisted by ID
      //  would want to also note the expiry time so we can clean up the blacklist every now and then.
      } else {
        console.log('error case, user: ', user);
        throw('There was no valid user found matching this info')
      }
    });
}

function resetPassword(req, res, next) {
  let email = req.body.email_address;
  let altEmail = req.body.alt_email_address;

  db.connection.any('SELECT * FROM users WHERE email_address = $1 LIMIT 1', email)
    .then(function (users) {

      if (users.length == 1) {

        let user = users[0];
        return userUtils.issueResetEmail(user, altEmail)
          .then(function () {
            res.status(200)
              .json({
                status: 'success',
                message: 'Reset Password Email Sent'
              });
        })
          .catch(controllerUtils.errorHandler(res, 400));

      } else {
        res.status(401).json({
          status: 'unauthorized',
          message: 'No User found'
        });
      }

    })
    .catch(controllerUtils.errorHandler(res, 400));
}

function lookupUsers(req, res, next) {
  let searchQuery = req.query.userSearchString || req.query.user_search_string;

  db.connection.any('select email_address from users where first_name like $1 or last_name like $1 or email_address like $1', ['%' + searchQuery + '%'])
    .then(function (data) {

      res.status(200)
        .json(data);
    })
    .catch(controllerUtils.errorHandler(res, 400));
}

function getUserInfo(req, res, next) {
  let email = req.query.emailAddress || req.query.email_address;

  db.connection.any('SELECT first_name, last_name, email_address, profile_image FROM users WHERE email_address = $1', [email])
    .then(function (data) {
      res.status(200)
        .json(data[0]);
    })
    .catch(controllerUtils.errorHandler(res, 400));
}

function adminGetUserInfo(req, res, next) {
  let email = req.query.emailAddress || req.query.email_address;

  db.adminGetUserInfoByEmail(email)
    .then(function (user) {
      res.status(200)
        .json(user);
    })
    .catch(controllerUtils.errorHandler(res, 400));
}

function checkFirstPass(req, res, next) {
  let email = req.query.emailAddress || req.query.email_address;

  db.connection.any('SELECT count(1) FROM users WHERE email_address = $1 AND has_set_first_pw = true', [email])
    .then(function (data) {
      if (data.length == 1) {
        let count = data[0].count;
        if (count == 1) {
          res.status(200)
            .json({ has_set_first_pw: true });
          return;
        }
      }
      res.status(200)
        .json({ has_set_first_pw: false });
    })
    .catch(controllerUtils.errorHandler(res, 400));
}

function deleteUser(req, res, next) {
  let email = req.body.emailAddress || req.body.email_address;

  db.connection.any('select id from users where email_address = $1', [email])
    .then(function (data) {
      if (data.length == 1) {
        return deleteUserById(data[0].id)
          .then(function () {
            res.status(200)
              .json({ message: 'user deleted' });
          });
      } else {
        //  somethings wrong here
        let err = null;
        if (data.length == 0) {
          err = new Error('email specified to delete does not match any existing users. email provided: ' + email)
        } else {
          err = new Error('email specified to delete matches multiple users. email provided: ' + email)
        }
        throw(err);
      }
    })
    .catch(controllerUtils.errorHandler(res, 400));
}

function deleteUserById(user_id) {
  let deleteString = 'DELETE FROM users WHERE id = $1';
  //TODO: delete user_devices, boot from all sessions, etc.
  return db.connection.any(deleteString, [user_id]);
}

function getAllUsers(req, res, next) {
  db.getUsersInfo()
    .then(db.formatUsers)
    .then(function (usersInfo) {
      res.status(200).json(usersInfo);
    })
    .catch(controllerUtils.errorHandler(res, 400));
}

function adminGetAllUsers(req, res, next) {
  db.adminGetUsersInfo()
    .then(db.adminFormatUsers)
    .then(function (usersInfo) {
      res.status(200).json(usersInfo);
    })
    .catch(controllerUtils.errorHandler(res, 400));
}

function createUser(req, res, next) {

  let email = req.body.email || req.body.email_address;
  let firstName = req.body.first_name;
  let lastName = req.body.last_name;

  let selectString = 'SELECT id FROM users WHERE lower(email_address) = lower($1)';

  db.connection.any(selectString, [email])
    .then(function (userRows) {

      if (userRows.length > 0) {

        let responseMessage = 'user with this email already exists: ' + email;

        res.status(422)
          .json({
            success: false,
            message: responseMessage
          });

      } else {

        let newUser = {
          first_name: firstName,
          last_name: lastName,
          email_address: email,
          is_admin: false
        };

        let adminName = req.user.first_name;

        return userUtils.postNewUser(newUser)
          .then(function (createdUser) {

            return userUtils.doNewUserInvite(createdUser, adminName)
              .then(function () {
                res.status(200)
                  .json(createdUser);
              });

          })
          .catch(function (err) {
            console.log('error while creating user', err);
            return next(err);
          });

      }
    })
    .catch(controllerUtils.errorHandler(res, 400));
}

function createAdmin(req, res, next) {

  let email = req.body.email || req.body.email_address;
  let firstName = req.body.first_name;
  let lastName = req.body.last_name;

  let selectString = 'SELECT id FROM users WHERE lower(email_address) = lower($1)';

  db.connection.any(selectString, [email])
    .then(function (userRows) {

      if (userRows.length > 0) {

        let responseMessage = 'user with this email already exists: ' + email;

        res.status(422)
          .json({
            success: false,
            message: responseMessage
          });

      } else {
        let newUser = {
          first_name: firstName,
          last_name: lastName,
          email_address: email,
          is_admin: true
        };

        let adminName = req.user.first_name;

        userUtils.postNewUser(newUser)
          .then(function (createdUser) {

            return userUtils.doNewAdminInvite(createdUser, adminName)
              .then(function () {
                res.status(200)
                  .json(createdUser);
              });

          })
          .catch(function (err) {
            console.log('error while creating admin', err);
            return next(err);
          });
      }
    })
    .catch(controllerUtils.errorHandler(res, 400));
}

function resendInvite(req, res, next) {
  let adminName = req.user.first_name;
  let targetEmail = req.body.email;

  db.getUserInfoByEmail(targetEmail)
    .then(function (targetUser) {

      if (targetUser !== undefined) {

        return userUtils.doNewUserInvite(targetUser, adminName)
          .then(function () {
            res.status(200)
              .json({ success: true });
          });

      } else {

        res.status(404)
          .json({
            success: false,
            message: 'no user found matching that email' 
          });

      }

    })
    .catch(controllerUtils.errorHandler(res, 400));

}

function updateUser(req, res, next) {
  let email = req.body.email || req.body.email_address;
  let firstName = req.body.first_name;
  let lastName = req.body.last_name;
  let isAdmin = req.body.is_admin;

  let columns = [
    'users.id',
    'first_name',
    'last_name',
    'email_address',
    'profile_image',
    'updated_date_time',
    'created_date_time',
    'is_admin'
  ];

  let selectString = 'SELECT ' +
    columns.join(', ') +
    ' FROM users WHERE email_address = $1';

  db.connection.any(selectString, email)
    .then(function (userRows) {
      if (userRows.length == 1) {
        let user = userRows[0];

        let updatedUser = {
          first_name: firstName || user.first_name,
          last_name: lastName || user.last_name,
          email_address: email || user.email_address,
          is_admin: isAdmin || user.is_admin,
        };

        return saveUserUpdates(user.id, updatedUser)
          .then(controllerUtils.blankResponse(res));

      } else {
        throw('user not found');
      }
    })
    .catch(controllerUtils.errorHandler(res, 400));

}

function disableUser(req, res, next) {

  userFromReq(req)
    .then(function (user) {

      setUserDisabledState(user.id, true)
        .then(function () {
          res.status(200)
            .json({ message: 'user disabled' });
        });

    })
    .catch(controllerUtils.errorHandler(res, 400));
}

function enableUser(req, res, next) {

  userFromReq(req)
    .then(function (user) {

      setUserDisabledState(user.id, false)
        .then(function () {
          res.status(200)
            .json({ message: 'user enabled' });
        });

    })
    .catch(controllerUtils.errorHandler(res, 400));

}

function userFromReq(req) {
  let email = req.body.emailAddress || req.body.email_address;

  return db.connection.any('select id from users where email_address = $1', [email])
    .then(function (data) {

      if (data.length == 1) {
        return data[0];
      } else if (data.length > 1) {
        throw('email specified matches multiple users. email provided: ' + email);
      } else {
        throw('email specified does not match any users. email provided: ' + email);
      }
    });
}

function setUserDisabledState(user_id, targetStateBool) {
  let isDisabled = true;
  if (targetStateBool === false) {
    isDisabled = false;
  }
  let updateString = 'UPDATE users SET is_disabled = ' + isDisabled + ' WHERE id = $1 AND is_admin = false';
  return db.connection.any(updateString, [user_id]);
}

function saveUserUpdates(id, userInfo) {
  userInfo.updated_date_time = 'now()';
  return db.updateById('users', userInfo, id);
}