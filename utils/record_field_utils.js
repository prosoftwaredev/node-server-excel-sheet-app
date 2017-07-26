const db = require('../config/db');
const sheetUtils = require('./sheet_utils');

const tableName = 'sheet_record_fields';
module.exports = {
  getSheetFields: getSheetFields,
  getRecordField: getRecordField,
  updateRecordField: updateRecordField,
  createRecordField: createRecordField,
  deleteRecordField: deleteRecordField,
  checkRecordFieldExists: checkRecordFieldExists,
};

function getSheetFields(sheet_id) {
  return db.selectColumns(tableName, ['*'], ['sheet_id = ' + sheet_id], null, 'ORDER BY field_number');
}

function getRecordField(record_field_id) {
  return db.selectColumns(tableName, ['*'], ['id = ' + record_field_id])
    .then(function (rows) {
      return rows.pop();
    });
}

function updateRecordField(record_field_id, updatedRecordField) {
  let timeStamp = new Date().toISOString();
  updatedRecordField.updated_date_time = timeStamp;
  return checkRecordFieldExists(record_field_id)
    .then(function() {
      return db.updateById(tableName, updatedRecordField, record_field_id)
        .then(function () {
          return getRecordField(record_field_id);
        });
    });
}

function createRecordField(newRecordField) {
  let timeStamp = new Date().toISOString();
  newRecordField.created_date_time = timeStamp;
  newRecordField.updated_date_time = timeStamp;
  return db.insertReturnIds(tableName, newRecordField)
    .then(function (rows) {
      let id = rows[0].id;
      return getRecordField(id);
    });
}

function deleteRecordField(record_field_id) {
  if (record_field_id == undefined || record_field_id == null || typeof record_field_id != 'number') {
    return Promise.reject('invalid record_field_id');
  }

  return checkRecordFieldExists(record_field_id)
    .then(function() {
      return db.deleteFrom(tableName, ['id = ' + record_field_id]);
    });
}

function checkRecordFieldExists(record_field_id) {
  if (record_field_id == undefined || record_field_id == null || typeof record_field_id != 'number') {
    return Promise.reject('invalid record_field_id');
  }

  return db.selectColumns(tableName, ['id'], ['id = ' + record_field_id])
    .then(function (rows) {
      if (rows.length == 0) {
        throw('requested record_field does not exist');
      }
    });
}
