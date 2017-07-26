const db = require('../config/db');
const multer  = require('multer');
const uuid = require('uuid/v4');

const profileImageFilePath = 'uploads/profile_images/';
const profileImageServingPath = '/protected/profile_images/';

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, profileImageFilePath);
  },

  filename: function (req, file, cb) {
    let oldFileName = file.originalname.split('.');
    let extension = oldFileName.pop();

    cb(null, uuid() + '.' + extension);
  },
});

const upload = multer({ storage: storage });

function uploadCallback(req, res) {
  let image = req.file;
  let email = req.user.email_address;

  if (image && image.filename) {
    db.connection.any('UPDATE users SET profile_image = $1 WHERE email_address = $2', [profileImageServingPath + image.filename, email])
      .then(function () {
        res.status(200).json({
          status: 'success',
          message: 'picture uploaded',
        });
      });
  } else {
    res.status(422).json({
      success: false,
      message: 'there was a problem processing the file you uploaded.'
    })
  }
}

function adminUploadCallback(req, res) {
  let image = req.file;
  let email = req.body.user_email_address;

  if (image && image.filename) {

    db.connection.any('UPDATE users SET profile_image = $1 WHERE email_address = $2', [profileImageServingPath + image.filename, email])
      .then(function () {
        res.status(200).json({
          status: 'success',
          message: 'picture uploaded',
        });
      });

  } else {
    res.status(422).json({
      success: false,
      message: 'there was a problem processing the file you uploaded.'
    })
  }

}

module.exports = {
  uploadCallback: uploadCallback,
  adminUploadCallback: adminUploadCallback,
  imageUploadHandler: upload.single('image'),
};
