const db = require('../config/db');
const recordUtils = require('../utils/record_utils');
const controllerUtils = require('../utils/controller_utils');

module.exports = {
  create: create,
  get: get,
  update: update,
  deleteRecord: deleteRecord,
  deleteMultipleRecords: deleteMultipleRecords,
};

function create(req, res) {
  let sheet_id = req.body.sheet_id;

  let newRecord = {
    sheet_id: sheet_id,
    1: req.body['1'],
    2: req.body['2'],
    3: req.body['3'],
    4: req.body['4'],
    5: req.body['5'],
    6: req.body['6'],
    7: req.body['7'],
    8: req.body['8'],
    9: req.body['9'],
    10: req.body['10'],
  };

  return recordUtils.createRecord(newRecord)
    .then(controllerUtils.respondWithRecord(res))
    .catch(controllerUtils.errorHandler(res, 422));
}

function get(req, res) {
  let id = req.query.id;

  return recordUtils.getRecord(id)
    .then(controllerUtils.respondWithRecord(res))
    .catch(controllerUtils.errorHandler(res, 404));
}

function update(req, res) {
  let record_id = req.body.id;

  let updatedRecord = {
    1: req.body['1'],
    2: req.body['2'],
    3: req.body['3'],
    4: req.body['4'],
    5: req.body['5'],
    6: req.body['6'],
    7: req.body['7'],
    8: req.body['8'],
    9: req.body['9'],
    10: req.body['10'],
  };

  return recordUtils.updateRecord(record_id, updatedRecord)
    .then(controllerUtils.respondWithRecord(res))
    .catch(controllerUtils.errorHandler(res, 422));
}

function deleteRecord(req, res) {
  let record_id = req.body.id;

  return recordUtils.deleteRecord(record_id)
    .then(controllerUtils.blankResponse(res))
    .catch(controllerUtils.errorHandler(res, 404));
}

function deleteMultipleRecords(req, res) {
  let recordIds = req.body.record_ids;

  return recordUtils.deleteMultipleRecords(recordIds)
    .then(controllerUtils.blankResponse(res))
    .catch(controllerUtils.errorHandler(res, 404));
}
