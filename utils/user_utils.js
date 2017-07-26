const jwt = require('jsonwebtoken');
const config = require('../config');
const mailer = require('../config/mailer');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const db = require('../config/db');
const saltRounds = 10;

module.exports = {
  genRandomString: genRandomString,
  saltHashPassword: saltHashPassword,
  postNewUser: postNewUser,
  updateUserPassword: updateUserPassword,
  doNewUserInvite: doNewUserInvite,
  doNewAdminInvite: doNewAdminInvite,
  generateToken: generateToken,
  issueResetEmail: issueResetEmail,
  checkUserExists: checkUserExists,
  checkMultipleUsersExist: checkMultipleUsersExist,
};

const tableName = 'users';

function checkUserExists(user_id) {
  if (user_id == undefined || user_id == null || typeof user_id != 'number') {
    return Promise.reject('invalid user_id');
  }

  return db.selectColumns(tableName, ['id'], ['id = ' + user_id])
    .then(function (rows) {
      if (rows.length == 0) {
        throw('requested user does not exist');
      }
    });
}

function checkMultipleUsersExist(userIds) {
  if (userIds.length == 0) {
    return Promise.reject('invalid userIds');
  }

  let uniqueUserIds = [...new Set(userIds)];

  for (let i = 0; i< uniqueUserIds.length; i++) {
    let user_id = uniqueUserIds[i];
    if (user_id == undefined || user_id == null || typeof user_id != 'number') {
      return Promise.reject('invalid user_id');
    }
  }

  return db.selectColumns(tableName, ['id'], ['id IN (' + uniqueUserIds.join(', ') + ')'])
    .then(function (rows) {
      if (rows.length != uniqueUserIds.length) {
        throw('one or more requested users does not exist');
      }
    });
}

function genRandomString(length) {
  return crypto.randomBytes(Math.ceil(length / 2))
      .toString('hex')
      .slice(0, length);
}

function saltHashPassword(passwords) {
  return new Promise(function (resolve, reject) {
    let password = passwords == null ? genRandomString(16) : passwords;

    bcrypt.hash(password, saltRounds, function (err, hash) {
      resolve({
        password: password,
        encrypted_password: hash,
      });
    });
  });
}

function postNewUser(newUser) {

  return saltHashPassword()
    .then(function (passwords) {
      newUser.encrypted_password = passwords.encrypted_password;

      return db.insertReturnIds('users', newUser)
        .then(function (ids) {
          let userId = ids[0].id;
          return db.selectUserInfo(userId)
            .then(function (userInfo) {
              let out = userInfo;
              userInfo.id = userId;
              return out;
            });
        });
    });
}

function updateUserPassword(userId, userNewPassword) {
  return saltHashPassword(userNewPassword)
    .then(function (passwords) {
      return db.connection.any('UPDATE users SET encrypted_password = $1, reset_string = NULL, has_set_first_pw = true WHERE id = $2',
        [passwords.encrypted_password, userId])
        .then(function () {
          return true;
        });
    });
}

function getResetToken(userId) {
  let resetString = genRandomString(16);

  return db.connection.any('UPDATE users SET reset_string = $1 WHERE id = $2', [resetString, userId])
    .then(function () {

      let tokenObject = {
        resetString: resetString
      };

      let issuedDate = new Date();
      let expirationDateTime = new Date(issuedDate.setHours(24, 0, 0, 0));
      let expiry = expirationDateTime.toISOString();

      let jwtResetToken = generateToken(tokenObject, '1d');

      return { token: jwtResetToken, expiry: expiry };
    });

}

function generateToken(tokenObject, expirationTime) {
  return jwt.sign(tokenObject, config.secret, {
    expiresIn: expirationTime || 10080 // in seconds
  });
}

function issueResetEmail(user) {
  return getResetToken(user.id)
    .then(function (tokenInfo) {
      mailer.resetForgottenPassword(user, tokenInfo.token, tokenInfo.expiry);

      return {
        status: 'success',
        message: 'Reset Password email sent'
      };
    });
}

function doNewUserInvite(user, adminName) {
  return getResetToken(user.id)
    .then(function (tokenInfo) {
      mailer.newUserInvite(user, tokenInfo.token, tokenInfo.expiry, adminName);

      return {
        status: 'success',
        message: 'Invite email sent'
      };
    });
}

function doNewAdminInvite(user, adminName) {
  return getResetToken(user.id)
    .then(function (tokenInfo) {
      mailer.newAdminInvite(user, tokenInfo.token, tokenInfo.expiry, adminName);

      return {
        status: 'success',
        message: 'Invite email sent'
      };
    });
}