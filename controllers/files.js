const db = require('../config/db');
const multer  = require('multer');
const uuid = require('uuid/v4');
const fileUtils = require('../utils/file_utils');
const controllerUtils = require('../utils/controller_utils');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, fileUtils.fileStoragePath);
  },

  filename: function (req, file, cb) {
    let oldFileName = file.originalname.split('.');
    let extension = oldFileName.pop();

    cb(null, uuid() + '.' + extension);
  },
});

const upload = multer({ storage: storage });

module.exports = {
  uploadCallback: uploadCallback,
  get: get,
  download: download,
  sheetFiles: sheetFiles,
  update: update,
  deleteFile: deleteFile,
  processCSV: processCSV,
  uploadHandler: upload.single('file'),
};

function uploadCallback(req, res) {
  let file = req.file;
  let sheet_id = req.body.sheet_id;
  let name = req.body.name;
  let description = req.body.description;

  let newFile = {
    sheet_id: sheet_id,
    name: name,
    description: description,
    serving_path: file.filename,
  };

  if (file && file.filename && newFile.sheet_id) {
    return fileUtils.createFile(newFile)
      .then(controllerUtils.respondWithRecord(res))
      .catch(controllerUtils.errorHandler(res, 422));
  } else {
    controllerUtils.errorHandler(res, 422)('there was a problem processing your upload.');
  }
}

function sheetFiles(req, res) {
  let sheet_id = req.query.sheet_id;

  return fileUtils.getSheetFiles(sheet_id)
    .then(controllerUtils.respondWithRecord(res))
    .catch(controllerUtils.errorHandler(res, 404));
}

function get(req, res) {
  let id = req.query.id;

  return fileUtils.getFile(id)
    .then(controllerUtils.respondWithRecord(res))
    .catch(controllerUtils.errorHandler(res, 404));
}

const fsOptions = {
  root: fileUtils.fileStoragePath,
  headers: {
    'x-timestamp': Date.now(),
    'x-sent': true
  }
};

function download(req, res) {
  let id = req.query.id;

  return fileUtils.getFile(id)
    .then(function (fileRecord) {
      let filePath = fileRecord.serving_path;
      res.sendFile(filePath, fsOptions);
    })
    .catch(controllerUtils.errorHandler(res, 404));
}

function update(req, res) {
  let file_id = req.body.id;
  let name = req.body.name;
  let description = req.body.description;

  let updatedFile = {
    name: name,
    description: description,
  };

  return fileUtils.updateFile(file_id, updatedFile)
    .then(controllerUtils.respondWithRecord(res))
    .catch(controllerUtils.errorHandler(res, 422));
}

function deleteFile(req, res) {
  let file_id = req.body.id;

  return fileUtils.deleteFile(file_id)
    .then(controllerUtils.blankResponse(res))
    .catch(controllerUtils.errorHandler(res, 404));
}

function processCSV(req, res) {
  let id = req.body.id;
  let fieldSpecs = req.body.fields;
  let shouldReturnRecords = req.body.return_records;

  return fileUtils.getFile(id)
    .then(function (file) {
      return fileUtils.importCSV(file, fieldSpecs, shouldReturnRecords);
    })
    .then(controllerUtils.respondWithRecord(res))
    .catch(controllerUtils.errorHandler(res, 422));
}
