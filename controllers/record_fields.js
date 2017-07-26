const fieldUtils = require('../utils/record_field_utils');
const controllerUtils = require('../utils/controller_utils');

module.exports = {
  create: create,
  get: get,
  update: update,
  deleteRecordField: deleteRecordField,
};

function create(req, res) {
  let sheet_id = req.body.sheet_id;
  let type = req.body.type;
  let name = req.body.name;
  let description = req.body.description;
  let field_number = req.body.field_number;

  let newRecordField = {
    sheet_id: sheet_id,
    type: type,
    name: name,
    description: description,
    field_number: field_number,
  };

  return fieldUtils.createRecordField(newRecordField)
    .then(controllerUtils.respondWithRecord(res))
    .catch(controllerUtils.errorHandler(res, 422));
}

function get(req, res) {
  let id = req.query.id;

  return fieldUtils.getRecordField(id)
    .then(controllerUtils.respondWithRecord(res))
    .catch(controllerUtils.errorHandler(res, 404));
}

function update(req, res) {
  let record_field_id = req.body.id;
  let type = req.body.type;
  let name = req.body.name;
  let description = req.body.description;

  let updatedRecordField = {
    type: type,
    name: name,
    description: description,
  };

  return fieldUtils.updateRecordField(record_field_id, updatedRecordField)
    .then(controllerUtils.respondWithRecord(res))
    .catch(controllerUtils.errorHandler(res, 422));
}

function deleteRecordField(req, res) {
  let record_field_id = req.body.id;

  return fieldUtils.deleteRecordField(record_field_id)
    .then(controllerUtils.blankResponse(res))
    .catch(controllerUtils.errorHandler(res, 404));
}
