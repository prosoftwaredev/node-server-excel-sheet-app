const db = require('../config/db');
const fs  = require('fs');
const parse = require('csv-parse/lib/sync');
// const transform = require('stream-transform');
const recordUtils = require('../utils/record_utils');

const tableName = 'files';
const recordsTable = 'sheet_records';
const fileStoragePath = 'uploads/files/';

module.exports = {
  getSheetFiles: getSheetFiles,
  getFile: getFile,
  updateFile: updateFile,
  createFile: createFile,
  deleteFile: deleteFile,
  checkFileExists: checkFileExists,
  importCSV: importCSV,
  fileStoragePath: fileStoragePath
};

function getSheetFiles(sheet_id) {
  return db.selectColumns(tableName, ['*'], ['sheet_id = ' + sheet_id]);
}

function getFile(file_id) {
  return db.selectColumns(tableName, ['*'], ['id = ' + file_id])
    .then(function (rows) {
      return rows.pop();
    });
}

function updateFile(file_id, updatedFile) {
  let timeStamp = new Date().toISOString();
  updatedFile.updated_date_time = timeStamp;
  return checkFileExists(file_id)
    .then(function() {
      return db.updateById(tableName, updatedFile, file_id)
        .then(function () {
          return getFile(file_id);
        });
    });
}

function createFile(newFile) {
  let timeStamp = new Date().toISOString();
  newFile.created_date_time = timeStamp;
  newFile.updated_date_time = timeStamp;
  return db.insertReturnIds(tableName, newFile)
    .then(function (rows) {
      let id = rows[0].id;
      return getFile(id);
    });
}

function deleteFile(file_id) {
  if (file_id == undefined || file_id == null || typeof file_id != 'number') {
    return Promise.reject('invalid file_id');
  }
  //TODO: remove file from disk / storage service
  return checkFileExists(file_id)
    .then(function() {
      return db.deleteFrom(tableName, ['id = ' + file_id]);
    });
}

function checkFileExists(file_id) {
  if (file_id == undefined || file_id == null || typeof file_id != 'number') {
    return Promise.reject('invalid file_id');
  }

  return db.selectColumns(tableName, ['id'], ['id = ' + file_id])
    .then(function (rows) {
      if (rows.length == 0) {
        throw('requested file does not exist');
      }
    });
}

function importCSV(file, fieldSpecs, shouldReturnRecords) {
  let filePath = fileStoragePath + file.serving_path;
  let rawData = fs.readFileSync(filePath);
  let parsedRows = parse(rawData, {columns: true});

  let newRecords = assembleNewRecords(parsedRows, fieldSpecs, file.sheet_id);

  if (shouldReturnRecords) {
    return db.insertArrayReturnRecords(recordsTable, newRecords);
  } else {
    return db.insertArray(recordsTable, newRecords);
  }
}

function assembleNewRecords(sourceRecords, fieldSpecs, sheet_id) {
  let newRecords = [];
  sourceRecords.forEach(function (row) {
    let timeStamp = new Date().toISOString();
    let tmpRecord = {
      sheet_id: sheet_id,
      created_date_time: timeStamp,
      updated_date_time: timeStamp
    };

    let fieldIndex = 1;
    Object.keys(fieldSpecs).forEach(function (key) {
      let fields = fieldSpecs[key] || [];
      tmpRecord[fieldIndex] = [];

      for (let i = 0; i < fields.length; i++) {
        let currentField = fields[i];
        tmpRecord[fieldIndex].push(row[currentField]);
      }

      tmpRecord[fieldIndex] = tmpRecord[fieldIndex].join(' ');
      fieldIndex++;
    });

    newRecords.push(tmpRecord);

  });

  return newRecords;
}