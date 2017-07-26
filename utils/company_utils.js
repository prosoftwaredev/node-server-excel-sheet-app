const db = require('../config/db');

module.exports = {
  getCompany: getCompany,
};

function getCompany() {
  let selectString = 'SELECT * FROM companies ORDER BY id LIMIT 1';
  return db.connection.any(selectString)
    .then(function (rows) {
      return rows[0];
    })
    .catch(function (err) {
      res.status(404)
        .json({
          error: err
        });
    });
}
