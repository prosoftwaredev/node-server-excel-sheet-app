const nodemailer = require('nodemailer');
const companyUtils = require('../utils/company_utils.js');


const smtpConfig = {
  host: process.env.MAILER_HOST,
  port: process.env.MAILER_PORT,
  secure: (process.env.MAILER_USE_SECURE_PROTOCOL == 'true') || false,
  auth: {
    user: 'apikey',
    pass: process.env.SENDGRID_API_KEY
  },
};

const userPasswordResetTemplate = "659ac225-91f9-4c83-8be9-77dbddf14841";
const userInviteTemplate = "35ba4734-7fb1-440a-9291-e777cc8f46f6";
const adminPasswordResetTemplate = "659ac225-91f9-4c83-8be9-77dbddf14841";
const adminInviteTemplate = "35ba4734-7fb1-440a-9291-e777cc8f46f6";
const confirmPasswordChangedTemplate = "1e88573c-b037-4d65-a18f-e07f1cc412a5";

module.exports = {
  resetForgottenPassword: resetForgottenPassword,
  resetAdminPassword: resetAdminPassword,
  newUserInvite: newUserInvite,
  confirmPasswordChange: confirmPasswordChange,
  newAdminInvite: newAdminInvite,
};

function newUserInvite(user, token, expiry, adminName) {

  companyUtils.getCompany()
    .then(function (companyInfo) {

      let uriParams = {
        reset_token: token,
        expiry: expiry,
        server_url: process.env.SERVER_URL,
        company_name: companyInfo.name,
        email_address: user.email_address,
      };
      let linkUri = constructUri(process.env.MAILER_INVITE_USER_LINK, uriParams);

      let mailOptions = {
        from: process.env.MAILER_FROM_EMAIL,
        to: user.email_address,
        subject: 'You\'ve been invited to join LawMap',
        headers: {
          'X-SMTPAPI': JSON.stringify({
            "sub": {
              ":link_url": [linkUri],
              ":user_name": [user.first_name],
              ":admin_name": [adminName]
            },
            "filters": {
              "templates": {
                "settings": {
                  "enable": 1,
                  "template_id": userInviteTemplate
                }
              }
            }
          })
        },
        text: '\n',
        html: '<br>'
      };

      sendMessage(mailOptions);

    });

}

function newAdminInvite(user, token, expiry, adminName) {

  companyUtils.getCompany()
    .then(function (companyInfo) {

      let uriParams = {
        reset_token: token,
        expiry: expiry,
        server_url: process.env.SERVER_URL,
        company_name: companyInfo.name,
        email_address: user.email_address,
      };

      let linkUri = constructUri(process.env.MAILER_INVITE_ADMIN_LINK, uriParams);

      let mailOptions = {
        from: process.env.MAILER_FROM_EMAIL,
        to: user.email_address,
        subject: 'You\'ve been invited to join LawMap',
        headers: {
          'X-SMTPAPI': JSON.stringify({
            "sub": {
              ":link_url": [linkUri],
              ":user_name": [user.first_name],
              ":admin_name": [adminName],
              ":company_name": [process.env.SERVER_COMPANY_NAME],
            },
            "filters": {
              "templates": {
                "settings": {
                  "enable": 1,
                  "template_id": adminInviteTemplate
                }
              }
            }
          })
        },
        text: '\n',
        html: '<br>'
      };

      sendMessage(mailOptions);

    });

}

function constructUri(base, params) {
  let out = base;

  if (base.indexOf('lawmap://') != -1) {
    out += '#';
  } else {
    out += '?';
  }

  let keyValuePairs = [];

  Object.keys(params).forEach(function (key) {
    let val = params[key];
    keyValuePairs.push(key + '=' + encodeURIComponent(val));
  });

  out += keyValuePairs.join('&');

  return out;
}

function resetForgottenPassword(user, token, expiry) {

  let uriParams = {
    reset_token: token,
    server_url: process.env.SERVER_URL,
    email_address: user.email_address,
    expiry: expiry
  };
  let linkUri = constructUri(process.env.MAILER_RESET_PASSWORD_LINK, uriParams);

  let mailOptions = {
    from: process.env.MAILER_FROM_EMAIL,
    to: user.email_address,
    subject: 'Reset Password',
    headers: {
      'X-SMTPAPI': JSON.stringify({
        "sub": {
          ":reset_link": [linkUri],
          ":user_name": [user.first_name],
        },
        "filters": {
          "templates": {
            "settings": {
              "enable": 1,
              "template_id": userPasswordResetTemplate
            }
          }
        }
      })
    },
    text: '\n',
    html: '<br>'
  };

  sendMessage(mailOptions);
}

function resetAdminPassword(user, token, expiry) {

  let uriParams = {
    reset_token: token,
    server_url: process.env.SERVER_URL,
    email_address: user.email_address,
    expiry: expiry
  };
  let linkUri = constructUri(process.env.MAILER_RESET_ADMIN_PASSWORD_LINK, uriParams);

  let mailOptions = {
    from: process.env.MAILER_FROM_EMAIL,
    to: user.email_address,
    subject: 'Reset Password',
    headers: {
      'X-SMTPAPI': JSON.stringify({
        "sub": {
          ":reset_link": [linkUri],
          ":user_name": [user.first_name],
        },
        "filters": {
          "templates": {
            "settings": {
              "enable": 1,
              "template_id": adminPasswordResetTemplate
            }
          }
        }
      })
    },
    text: '\n',
    html: '<br>'
  };

  sendMessage(mailOptions);
}

function confirmPasswordChange(user) {
  let uriParams = {
    server_url: process.env.SERVER_URL,
    email_address: user.email_address
  };

  let linkUri = constructUri(process.env.MAILER_CHANGED_PW_LINK, uriParams);
  let substitutions = {
    ":link_url": [linkUri],
    ":user_name": [user.first_name],
  };

  mailWithTemplate(user.email_address, 'Your password has been set.', confirmPasswordChangedTemplate, substitutions);
}

function mailWithTemplate(toEmail, subject, templateId, substitutions) {
  let mailOptions = {
    from: process.env.MAILER_FROM_EMAIL,
    to: toEmail,
    subject: subject,
    headers: {
      'X-SMTPAPI': JSON.stringify({
        "sub": substitutions,
        "filters": {
          "templates": {
            "settings": {
              "enable": 1,
              "template_id": templateId
            }
          }
        }
      })
    },
    text: '\n',
    html: '<br>'
  };

  sendMessage(mailOptions);
}

function sendMessage(mailOptions) {

  let transporter = nodemailer.createTransport(smtpConfig);

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log('sendMail error: ', error);
    }
    if (info) {
      console.log('sendMail info: ', info);
    }
  });
}
