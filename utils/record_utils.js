const db = require('../config/db');
const attachmentUtils = require('./attachment_utils');

const tableName = 'sheet_records';
module.exports = {
  getRecord: getRecord,
  getSheetRecords: getSheetRecords,
  updateRecord: updateRecord,
  createRecord: createRecord,
  deleteRecord: deleteRecord,
  deleteMultipleRecords: deleteMultipleRecords,
  checkRecordExists: checkRecordExists,
};

function getSheetRecords(sheet_id) {
  return db.selectColumns(tableName, ['*'], ['sheet_id = ' + sheet_id])
    .then(function (records) {
      let recordIds = [];
      for (let i = 0; i < records.length; i++) {
        recordIds.push(records[i].id);
      }
      return attachmentUtils.getAttachmentsForMultipleRecords(recordIds)
        .then(function (attachments) {
          let tmp = {};
          attachments.forEach(function (attachment) {
            tmp[attachment.sheet_record_id] = tmp[attachment.sheet_record_id] || [];
            tmp[attachment.sheet_record_id].push(attachment);
          });
          records.forEach(function (record) {
            record.attachments = tmp[record.id] || [];
          });

          return records;
        });
    });
}

function getRecord(record_id) {
  return db.selectColumns(tableName, ['*'], ['id = ' + record_id])
    .then(function (rows) {
      if (rows.length == 1) {
        let record = rows[0];
        return attachmentUtils.getRecordAttachments(record_id)
          .then(function (attachments) {
            record.attachments = attachments;
            return record;
          });
      }
    });
}

function updateRecord(record_id, updatedRecord) {
  let timeStamp = new Date().toISOString();
  updatedRecord.updated_date_time = timeStamp;
  return checkRecordExists(record_id)
    .then(function() {
      return db.updateById(tableName, updatedRecord, record_id)
        .then(function () {
          return getRecord(record_id);
        });
    });
}

function createRecord(newRecord) {
  let timeStamp = new Date().toISOString();
  newRecord.created_date_time = timeStamp;
  newRecord.updated_date_time = timeStamp;
  return db.insertReturnIds(tableName, newRecord)
    .then(function (rows) {
      let id = rows[0].id;
      return getRecord(id);
    });
}

function deleteRecord(record_id) {
  if (record_id == undefined || record_id == null || typeof record_id != 'number') {
    return Promise.reject('invalid record_id');
  }

  return checkRecordExists(record_id)
    .then(function() {
      return db.deleteFrom(tableName, ['id = ' + record_id]);
    });
}

function deleteMultipleRecords(recordIds) {
  if (recordIds.length == 0) {
    return Promise.reject('invalid recordIds');
  }

  let uniqueRecordIds = [...new Set(recordIds)];

  for (let i = 0; i< uniqueRecordIds.length; i++) {
    let record_id = uniqueRecordIds[i];
    if (record_id == undefined || record_id == null || typeof record_id != 'number') {
      return Promise.reject('invalid record_id');
    }
  }

  return db.deleteFrom(tableName, ['id IN (' + uniqueRecordIds + ')']);
}

function checkRecordExists(record_id) {
  if (record_id == undefined || record_id == null || typeof record_id != 'number') {
    return Promise.reject('invalid record_id');
  }

  return db.selectColumns(tableName, ['id'], ['id = ' + record_id])
    .then(function (rows) {
      if (rows.length == 0) {
        throw('requested record does not exist');
      }
    });
}
