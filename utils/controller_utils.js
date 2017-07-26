const db = require('../config/db');

module.exports = {
  genericHandler: genericHandler,
  errorHandler: errorHandler,
  blankResponse: blankResponse,
  respondWithRecord: respondWithRecord,
};

function genericHandler(req, res, next) {
  console.log('req.body: ', req.body);
  res.status(200).json({ success: true });
}

function errorHandler(res, status) {
  let code = status || 400;
  return function (err) {
    res.status(code).json({ success: false, error: err });
  };
}

function blankResponse(res) {
  return function () {
    res.status(200).json({
      success: true
    });
  }
}
function respondWithRecord(res) {
  return function (record) {
    res.status(200).json(record);
  }
}