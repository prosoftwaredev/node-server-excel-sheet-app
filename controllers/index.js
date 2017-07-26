let express = require('express');
let router = express.Router();
let uuid = require('uuid/v4');

/* GET home page. */
router.get('/', function (req, res, next) {
  res.locals.device_id = uuid();
  res.render('index', { title: 'Express' });
});

module.exports = router;
