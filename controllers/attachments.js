const db = require('../config/db');
const attachmentUtils = require('../utils/attachment_utils');
const controllerUtils = require('../utils/controller_utils');

module.exports = {
  create: create,
  get: get,
  update: update,
  deleteAttachment: deleteAttachment,
};

function create(req, res) {
  let record_id = req.body.record_id;
  let file_id = req.body.file_id;
  let note = req.body.note;

  let newAttachment = {
    sheet_record_id: record_id,
    file_id: file_id,
    note: note,
  };

  return attachmentUtils.createAttachment(newAttachment)
    .then(controllerUtils.respondWithRecord(res))
    .catch(controllerUtils.errorHandler(res, 422));
}

function get(req, res) {
  let id = req.query.id;

  return attachmentUtils.getAttachment(id)
    .then(controllerUtils.respondWithRecord(res))
    .catch(controllerUtils.errorHandler(res, 404));
}

function update(req, res) {
  let id = req.body.id;
  let file_id = req.body.file_id;
  let note = req.body.note;

  let updatedAttachment = {
    file_id: file_id,
    note: note,
  };

  return attachmentUtils.updateAttachment(id, updatedAttachment)
    .then(controllerUtils.respondWithRecord(res))
    .catch(controllerUtils.errorHandler(res, 422));
}

function deleteAttachment(req, res) {
  let id = req.body.id;

  return attachmentUtils.deleteAttachment(id)
    .then(controllerUtils.blankResponse(res))
    .catch(controllerUtils.errorHandler(res, 404));
}
