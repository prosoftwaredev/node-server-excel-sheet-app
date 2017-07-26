const db = require('../config/db');
const sheetUtils = require('../utils/sheet_utils');
const controllerUtils = require('../utils/controller_utils');

module.exports = {
  index: index,
  create: create,
  get: get,
  getCSV: getCSV,
  update: update,
  addGroup: addGroup,
  removeGroup: removeGroup,
  deleteSheet: deleteSheet,
};

function index(req, res) {
  return sheetUtils.getAllSheets()
    .then(controllerUtils.respondWithRecord(res))
    .catch(controllerUtils.errorHandler(res, 404));
}

function get(req, res) {
  let id = req.query.id;

  return sheetUtils.getSheet(id)
    .then(controllerUtils.respondWithRecord(res))
    .catch(controllerUtils.errorHandler(res, 404));
}

function getCSV(req, res) {
  let id = req.query.id;

  return sheetUtils.getSheetCSV(id)
    .then(controllerUtils.respondWithRecord(res))
    .catch(controllerUtils.errorHandler(res, 404));
}

function update(req, res) {
  let id = req.body.id;
  let title = req.body.title;
  let description = req.body.description;

  let updatedSheet = {
    title: title,
    description: description
  };

  return sheetUtils.updateSheet(id, updatedSheet)
    .then(controllerUtils.respondWithRecord(res))
    .catch(controllerUtils.errorHandler(res, 422));
}

function create(req, res) {
  let title = req.body.title;
  let description = req.body.description;

  let newSheet = {
    title: title,
    description: description,
    created_by_user_id: req.user.id
  };

  return sheetUtils.createSheet(newSheet)
    .then(controllerUtils.respondWithRecord(res))
    .catch(controllerUtils.errorHandler(res, 422));
}

function addGroup(req, res) {
  let sheet_id = req.body.id;
  let user_group_id = req.body.user_group_id;

  let newAccessGroup = {
    sheet_id: sheet_id,
    user_group_id: user_group_id
  };

  return sheetUtils.createAccessGroup(newAccessGroup)
    .then(controllerUtils.blankResponse(res))
    .catch(controllerUtils.errorHandler(res, 422));
}

function removeGroup(req, res) {
  let sheet_id = req.body.id;
  let group_id = req.body.group_id;

  return sheetUtils.removeAccessGroup(group_id, sheet_id)
    .then(controllerUtils.blankResponse(res))
    .catch(controllerUtils.errorHandler(res, 422));
}

function deleteSheet(req, res) {
  let sheet_id = req.body.id;

  return sheetUtils.deleteSheet(sheet_id)
    .then(controllerUtils.blankResponse(res))
    .catch(controllerUtils.errorHandler(res, 404));
}
