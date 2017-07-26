const db = require('../config/db');

const tableName = 'record_file_attachments';
const fileJoinTable = tableName + ' LEFT JOIN files ON ' + tableName + '.file_id = files.id';

module.exports = {
  getAttachment: getAttachment,
  getRecordAttachments: getRecordAttachments,
  getAttachmentsForMultipleRecords: getAttachmentsForMultipleRecords,
  updateAttachment: updateAttachment,
  createAttachment: createAttachment,
  deleteAttachment: deleteAttachment,
  checkAttachmentExists: checkAttachmentExists,
};

function getRecordAttachments(record_id) {
  return db.selectColumns(fileJoinTable, ['*'], ['sheet_record_id = ' + record_id]);
}

function getAttachment(attachment_id) {
  let selectString = 'SELECT * FROM ' + fileJoinTable;
  selectString += ' WHERE ' + tableName + '.id = ' + attachment_id;
  return db.connection.any(selectString)
    .then(function (rows) {
      return rows.pop();
    });
}

function getAttachmentsForMultipleRecords(recordIds) {
  if (recordIds.length > 0) {
    return db.selectColumns(tableName, ['*'], ['sheet_record_id IN (' + recordIds.join(', ') + ')']);
  } else {
    return Promise.resolve([]);
  }
}

function updateAttachment(attachment_id, updatedAttachment) {
  let timeStamp = new Date().toISOString();
  updatedAttachment.updated_date_time = timeStamp;
  return checkAttachmentExists(attachment_id)
    .then(function() {
      return db.updateById(tableName, updatedAttachment, attachment_id)
        .then(function () {
          return getAttachment(attachment_id);
        });
    });
}

function createAttachment(newAttachment) {
  let timeStamp = new Date().toISOString();
  newAttachment.created_date_time = timeStamp;
  newAttachment.updated_date_time = timeStamp;
  return db.insertReturnIds(tableName, newAttachment)
    .then(function (rows) {
      let id = rows[0].id;
      return getAttachment(id);
    });
}

function deleteAttachment(attachment_id) {
  if (attachment_id == undefined || attachment_id == null || typeof attachment_id != 'number') {
    return Promise.reject('invalid attachment_id');
  }

  return checkAttachmentExists(attachment_id)
    .then(function() {
      return db.deleteFrom(tableName, ['id = ' + attachment_id]);
    });
}

function checkAttachmentExists(attachment_id) {
  if (attachment_id == undefined || attachment_id == null || typeof attachment_id != 'number') {
    return Promise.reject('invalid attachment_id');
  }

  return db.selectColumns(tableName, ['id'], ['id = ' + attachment_id])
    .then(function (rows) {
      if (rows.length == 0) {
        throw('requested attachment does not exist');
      }
    });
}
