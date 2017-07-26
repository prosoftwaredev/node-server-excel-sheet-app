const crypto = require('crypto');
const bcrypt = require('bcrypt');
const config = require('../config');
const db = require('../config/db');

module.exports = {
  seed: seed,
  seedAdmin: seedAdmin,
  seedCompany: seedCompany,
  doSeedAdmin: doSeedAdmin,
  doSeedCompany: doSeedCompany,
  doSeedUsers: doSeedUsers,
};

const usersPerLevel = 5;
const totalLevels = 10;

function seedAdmin(req, res, next) {

  doSeedAdmin()
    .then(function () {
      res.json({});
    });

}

function seedCompany(req, res, next) {

  doSeedCompany()
    .then(function () {
      res.json({});
    });

}

function seed(req, res, next) {

  doSeedUsers();

  res.json({});
}

function doSeedAdmin() {
  return db.connection.any("SELECT count(1) FROM users WHERE is_admin = true AND is_disabled = false AND email_address = \'admin1@lawmap.io\'")
    .then(function (rows) {
      if (rows[0].count < 1) {

        return db.connection.any("DELETE FROM users WHERE email_address = \'admin1@lawmap.io\' OR email_address = \'admin2@lawmap.io\'")
          .then(function () {
            return createSeedAdmins();
          });
      }
    });
}

function doSeedCompany() {
  let company = {
    name: process.env.SERVER_COMPANY_NAME || 'company name not set',
    logo_image: null
  };

  return db.connection.any('DELETE FROM companies')
    .then(function () {
      return db.insert('companies', company);
    });
}

function doSeedUsers() {
  return db.connection.any("DELETE FROM users")
    .then(function () {

      return createSeedUsers()
        .then(function () {

          return createSeedAdmins();
        });
    });
}

function createSeedUsers() {

  let seedPassword = 'lawmap';
  let userProps = genUserProps();

  for (let i = 0; i < userProps.length; i++) {
    let tmpUserProps = userProps[i];
    let newUser = {
      email_address: tmpUserProps.email_address,
      first_name: tmpUserProps.first_name,
      last_name: tmpUserProps.last_name,
      profile_image: tmpUserProps.profile_image,
      has_set_first_pw: true,
    };

    newUser.encrypted_password = bcrypt.hashSync(seedPassword, 1);

    if (i == userProps.length - 1) {
      return postNewUser(newUser);
    } else {
      postNewUser(newUser);
    }

  }
}

function createSeedAdmins() {

  let seedPassword = 'lawmap';
  let userProps = genUserProps();

  for (let i = 1; i < 3; i++) {
    let tmpUserProps = userProps[i];
    let newUser = {
      email_address: 'admin' + i + '@lawmap.io',
      first_name: 'admin' + i,
      last_name: tmpUserProps.last_name,
      profile_image: tmpUserProps.profile_image,
      has_set_first_pw: true,
      is_admin: true
    };

    newUser.encrypted_password = bcrypt.hashSync(seedPassword, 1);

    if (i == userProps.length) {
      postNewUser(newUser).then(function (newUser) {
        // call next or something?
      })
    } else {
      postNewUser(newUser);
    }

  }
}

function genUserProps() {
  let out = [];
  let profileImagePath = '/protected/profile_images/';
  let profileImage = profileImagePath + 'test.jpg';

  for (let i = 1; i <= totalLevels; i++) {
    for (let j = 0; j < usersPerLevel; j++) {

      let uid = genUserString({level: i, userNum: j});

      let newUser = {
        email_address: uid + '@lawmap.io',
        first_name: uid,
        last_name: 'seedUser',
        profile_image: profileImage,
      };

      out.push(newUser);
    }
  }

  let demoUsers = [{ first_name: 'Johnnie', last_name: 'Cochran', email_address: 'jcochran@lawmap.io', profile_image: 'jcochran@lawmap.io.jpg' },
    { first_name: 'Judge Lance', last_name: 'Ito', email_address: 'lito@lawmap.io', profile_image: 'lito@lawmap.io.jpg'},
    { first_name: 'Robert', last_name: 'Shapiro', email_address: 'rshapiro@lawmap.io', profile_image: 'rshapiro@lawmap.io.jpg' },
    { first_name: 'Robert', last_name: 'Kardashian', email_address: 'rkardashian@lawmap.io', profile_image: 'rkardashian@lawmap.io.jpg' },
    { first_name: 'F. Lee', last_name: 'Bailey', email_address: 'fbailey@lawmap.io', profile_image: 'fbailey@lawmap.io.jpg' },
    { first_name: 'Marcia', last_name: 'Clark', email_address: 'mclark@lawmap.io', profile_image: 'mclark@lawmap.io.jpg' },
    { first_name: 'Christopher', last_name: 'Darden', email_address: 'cdarden@lawmap.io', profile_image: 'cdarden@lawmap.io.jpg' },
    { first_name: 'Barry', last_name: 'Scheck', email_address: 'bscheck@lawmap.io', profile_image: 'bscheck@lawmap.io.jpg' },
    { first_name: 'Al', last_name: 'Cowlings', email_address: 'acowlings@lawmap.io', profile_image: 'acowlings@lawmap.io.jpg' },
    { first_name: 'Mark', last_name: 'Fuhrman', email_address: 'mfuhrman@lawmap.io', profile_image: 'mfuhrman@lawmap.io.jpg' },
    { first_name: 'Gil', last_name: 'Garcetti', email_address: 'ggarcetti@lawmap.io', profile_image: 'ggarcetti@lawmap.io.jpg' },
    { first_name: 'Carl E.', last_name: 'Douglas', email_address: 'cdouglas@lawmap.io', profile_image: 'cdouglas@lawmap.io.jpg' },
    { first_name: 'Vincent', last_name: 'Bugliosi', email_address: 'vbugliosi@lawmap.io', profile_image: 'vbugliosi@lawmap.io.jpg' },
    { first_name: 'Brian', last_name: 'Kaelin', email_address: 'bkaelin@lawmap.io', profile_image: 'bkaelin@lawmap.io.jpg' },
  ];

  demoUsers.forEach(function (user) {
    let tmp = user;
    tmp.profile_image = profileImagePath + tmp.profile_image;
    out.push(user);
  });

  return out;

}

function genUserString(options) {
  const letters = 'abcdefghijklmnopqrstuvwxyz';
  let out = letters.charAt(options.userNum) + pad(options.level, 2);

  return out;
}

function pad(n, width, z) {
  z = z || '0';
  n = n + '';
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

function postNewUser(newUser) {
  let insertString = 'INSERT INTO users ('
    + Object.keys(newUser).join(', ') + ') VALUES (' + valuesStringGen(Object.keys(newUser).length) + ')';

  return db.connection.any(insertString, Object.values(newUser))
    .then(function () {
      return newUser;
    });

}

function valuesStringGen(propCount) {
  let out = '';
  for (let i = 0; i < propCount; i++) {
    if (i == 0) {
      out += '$' + (i+1);
    } else {
      out += ', $' + (i+1);
    }
  }
  return out;
}
