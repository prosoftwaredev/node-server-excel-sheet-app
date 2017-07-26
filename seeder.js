
let dotenv = require('dotenv');
dotenv.load();

const seeds = require('./controllers/seeds');

seeds.doSeedCompany()
  .then(function () {
    return seeds.doSeedUsers()
      .then(function () {
        process.exit();
      });
  })
  .catch(function (e) {
    console.log('error while seeding: ', e);
  });
