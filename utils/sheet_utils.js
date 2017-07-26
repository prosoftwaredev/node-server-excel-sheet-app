const db = require('../config/db');
const recordUtils = require('./record_utils');
const fieldUtils = require('./record_field_utils');
const json2csv = require('json2csv');
const groupUtils = require('./group_utils');

const tableName = 'sheets';
const sheetAccessTable = 'sheet_access_group';

module.exports = {
  getAllSheets: getAllSheets,
  getSheet: getSheet,
  getSheetCSV: getSheetCSV,
  updateSheet: updateSheet,
  createSheet: createSheet,
  deleteSheet: deleteSheet,
  checkSheetExists: checkSheetExists,
  createAccessGroup: createAccessGroup,
  removeAccessGroup: removeAccessGroup,
};

function getAllSheets() {
  return db.selectColumns(tableName);
}

function getSheetCSV(sheet_id) {
  return getSheet(sheet_id)
    .then(function (sheetObj) {
      let fields = buildCSVHeaders(sheetObj.fields);
      let data = buildCSVData(sheetObj.fields, sheetObj.records);

      try {
        let result = json2csv({ data: data, fields: fields });
        return { title: sheetObj.title, csv: result };
      } catch (err) {
        // Errors are thrown for bad options, or if the data is empty and no fields are provided.
        // Be sure to provide fields if it is possible that your data array will be empty.
        console.error(err);
      }
    });
}

function buildCSVData(fields, records) {
  let out = [];
  let line = {};
  records.forEach(function (record) {
    line = {};
    fields.forEach(function (field) {
      line[field.name] = record[field.field_number];
    });
    out.push(line);
  });
  return out;
}

function buildCSVHeaders(fields) {
  let out = [];
  fields.forEach(function (field) {
    out.push(field.name);
  });
  return out;
}

function getSheet(sheet_id) {
  if (sheet_id == undefined || sheet_id == null || sheet_id == 'undefined') {
    return Promise.reject('invalid sheet_id');
  }
  return db.selectColumns(tableName, ['*'], ['id = ' + sheet_id])
    .then(function (rows) {
      if (rows.length == 1) {
        let sheet = rows[0];
        return fieldUtils.getSheetFields(sheet_id)
          .then(function (fields) {
            sheet.fields = fields;
            return recordUtils.getSheetRecords(sheet_id)
              .then(function (records) {
                sheet.records = records;
                return sheet;
              });
          });
      }
    });
}

function updateSheet(sheet_id, updatedSheet) {
  if (sheet_id == undefined || sheet_id == null || sheet_id == 'undefined') {
    return Promise.reject('invalid sheet_id');
  }
  let timeStamp = new Date().toISOString();
  updatedSheet.updated_date_time = timeStamp;
  return checkSheetExists(sheet_id)
    .then(function() {
      return db.updateById(tableName, updatedSheet, sheet_id)
        .then(function () {
          return getSheet(sheet_id);
        });
    });
}

function createSheet(newSheet) {
  let timeStamp = new Date().toISOString();
  newSheet.created_date_time = timeStamp;
  newSheet.updated_date_time = timeStamp;
  return db.insertReturnIds(tableName, newSheet)
    .then(function (rows) {
      let id = rows[0].id;
      return getSheet(id);
    });
}

function deleteSheet(sheet_id) {
  if (sheet_id == undefined || sheet_id == null || sheet_id == 'undefined') {
    return Promise.reject('invalid sheet_id');
  }

  return checkSheetExists(sheet_id)
    .then(function() {
      return db.deleteFrom(tableName, ['id = ' + sheet_id]);
    });
}

function checkSheetExists(sheet_id) {
  if (sheet_id == undefined || sheet_id == null || sheet_id == 'undefined') {
    return Promise.reject('invalid sheet_id');
  }

  return db.selectColumns(tableName, ['id'], ['id = ' + sheet_id])
    .then(function (rows) {
      if (rows.length == 0) {
        throw('requested sheet does not exist');
      }
    });
}

function createAccessGroup(newAccessGroup) {
  return checkSheetExists(newAccessGroup.sheet_id)
    .then(function() {
      return groupUtils.checkUserGroupExists(newAccessGroup.user_group_id)
        .then(function () {
          return db.insertReturnIds(sheetAccessTable, newAccessGroup);
        });
    });
}

function removeAccessGroup(user_group_id, sheet_id) {
  return db.deleteFrom(sheetAccessTable, 'user_group_id = $1 AND sheet_id = $2', [user_group_id, sheet_id]);
}
