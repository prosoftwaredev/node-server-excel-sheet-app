const db = require('../config/db');
const uuid = require('uuid/v4');
const companyUtils = require('../utils/company_utils.js');

module.exports = {
  get: get,
  update: update,
  companyImageUploadCallback: companyImageUploadCallback,
};

function get(req, res) {

  return companyUtils.getCompany()
    .then(function (company) {
      res.status(200)
        .json({
          company: {
            name: company.name,
            logo_image: company.logo_image
          }
        });
    })
    .catch(function (err) {
      res.status(404)
        .json({
          error: err
        });
      });

}

function update(req, res) {
  let name = req.body.name;

  let updatedCompany = {
    name: name
  };

  return doCompanyUpdate(updatedCompany)
    .then(function () {
      return companyUtils.getCompany()
        .then(function (updatedCompany) {
          res.status(200).json({
            company: updatedCompany
          });
        });
    })
    .catch(function (err) {
      res.status(422)
        .json({
          error: err
        });
    });
}

function doCompanyUpdate(updatedCompany) {
  return companyUtils.getCompany()
    .then(function (company) {
      return db.updateById('companies', updatedCompany, company.id)
    });
}

function companyImageUploadCallback(req, res) {
  let image = req.file;
  let imageServingPath = '/protected/profile_images/';

  let updatedCompany = {
    logo_image: imageServingPath + image.filename
  };

  return doCompanyUpdate(updatedCompany)
    .then(function () {
      return companyUtils.getCompany()
        .then(function (updatedCompany) {
          res.status(200).json({
            company: updatedCompany
          });
        });
    })
    .catch(function (err) {
      res.status(422)
        .json({
          error: err
        });
    });
}