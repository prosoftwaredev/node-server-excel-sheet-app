const jwt = require('jsonwebtoken');
const config = require('../config');
const db = require('../config/db');
const uuid = require('uuid/v4');
const userUtils = require('../utils/user_utils.js');
const mailer = require('../config/mailer');

module.exports = {
  getResetPassword: getResetPassword,
  postReset: postReset,
};

function getResetPassword(req, res) {
  res.render('resetPassword', { title: 'Reset' });
}

function postReset(req, res) {
  let emailAddress = req.body.email_address;
  let newPassword = req.body.password;
  let resetToken = req.body.reset_token;

  db.connection.any('SELECT id, reset_string FROM users WHERE email_address = $1', emailAddress)
    .then(function (resetStrings) {
      let decodedToken = false;

      try {
        decodedToken = jwt.verify(resetToken, config.secret);
      } catch (err) {
        res.status(401).json({
          status: 'failed',
          message: 'Invalid or Expired Token.'
        });
        return;
      }

      if (decodedToken && resetStrings.length == 1) {

        let resetString = resetStrings[0].reset_string;
        let userId = resetStrings[0].id;

        if (resetString != undefined && decodedToken.resetString === resetString) {

          userUtils.updateUserPassword(userId, newPassword)
            .then(function () {
              triggerPasswordConfirmEmail(userId);
                res.status(200).json({
                  status: 'success',
                  message: 'Your password has been updated'
                });
              });

        } else {
          res.status(401).json({
            status: 'failed',
            message: 'reset token is not valid for this user'
          });
        }
      } else {
        res.status(404).json({
          status: 'failed',
          message: 'No users found.'
        });
      }
    }).catch(function () {
      res.status(404).json({
        status: 'failed',
        message: 'No users found.'
      });
    });

}

function triggerPasswordConfirmEmail(userId) {
  db.selectUserInfo(userId)
    .then(function (userInfo) {
      mailer.confirmPasswordChange(userInfo);
    });
}