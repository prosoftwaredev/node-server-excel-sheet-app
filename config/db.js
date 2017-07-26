const promise = require('bluebird');
const options = {
  promiseLib: promise
};
const pgp = require('pg-promise')(options);

const connectionString = process.env.DATABASE_URL;
const db = pgp(connectionString);
const uuid = require('uuid/v4');

module.exports = {
  connection: db,
  insert: insert,
  insertReturnIds: insertReturnIds,
  updateById: updateById,
  deleteFrom: deleteFrom,
  deleteById: deleteById,
  insertArray: insertArray,
  insertArrayReturnRecords: insertArrayReturnRecords,
  insertArrayIgnoreConflicts: insertArrayIgnoreConflicts,
  selectColumns: selectColumns,
  propFromRecords: propFromRecords,
  getUsersInfo: getUsersInfo,
  adminGetUserInfoByEmail: adminGetUserInfoByEmail,
  adminGetUsersInfo: adminGetUsersInfo,
  adminFormatUsers: adminFormatUsers,
  formatUsers: formatUsers,
  selectUserInfo: selectUserInfo,
  getUserInfoByEmail: getUserInfoByEmail,
};

function insert(table, object) {
  let insertString = buildInsertString(table, object);

  return db.any(insertString, Object.values(object))
}

function insertReturnIds(table, object) {
  let insertString = buildInsertString(table, object);

  insertString += ' RETURNING id';

  return db.any(insertString, Object.values(object))
}

function buildInsertString(table, object) {
  let columnsString = buildColumnsString(Object.keys(object));
  let valuesString = valuesStringGen(Object.keys(object).length);
  return 'INSERT INTO ' + table + ' (' + columnsString + ') VALUES (' + valuesString + ')';
}

function buildColumnsString(cols) {
  return '\"' + cols.join('\", \"') + '\"';
}

function updateById(table, object, id) {
  let bindings = [];
  let columnsString = buildColumnsString(Object.keys(object));

  Object.keys(object).forEach(function (key) {

    let val = object[key];
    let tmpString = '\"' + key + '\" =';
    if (typeof val == 'string') {
      tmpString += '\'' + val + '\'';
    } else {
      tmpString += val;
    }

    bindings.push(tmpString);
  });

  let updateString = 'UPDATE ' + table + ' SET '
    + bindings.join(', ') + ' WHERE id = $1';

  return db.any(updateString, id)

}

function insertArray(table, array) {
  let columnsString = buildColumnsString(Object.keys(array[0]));
  let insertString = 'INSERT INTO ' + table + ' ('
    + columnsString + ') VALUES ';

  let argsString = buildArgsString(array);

  return db.any(insertString + argsString)
}

function insertArrayReturnRecords(table, array) {
  let columnsString = buildColumnsString(Object.keys(array[0]));
  let insertString = 'INSERT INTO ' + table + ' ('
    + columnsString + ') VALUES ';

  let argsString = buildArgsString(array);

  insertString = insertString + argsString;
  insertString += ' RETURNING *';

  return db.any(insertString);
}

function insertArrayIgnoreConflicts(table, array, conflictTargets) {
  // must specify a unique index on the conflict target(s) in the schema before this will work
  let columnsString = buildColumnsString(Object.keys(array[0]));
  let insertString = 'INSERT INTO ' + table + ' ('
    + columnsString + ') VALUES ';

  let argsString = buildArgsString(array);

  let conflictString = ' ON CONFLICT (' + conflictTargets.join(', ') + ') DO NOTHING';

  return db.any(insertString + argsString + conflictString);
}

function deleteFrom(table, constraints, args) {

  let deleteString = 'DELETE FROM ' + table;
  deleteString += buildWhereString(constraints);

  if (typeof(args) !== 'undefined') {
    return db.any(deleteString, args);
  } else {
    return db.any(deleteString);
  }

}

function deleteById(table, id) {
  let deleteString = 'DELETE FROM ' + table;
  deleteString += ' WHERE id = $1';

  return db.any(deleteString, id);
}

function buildArgsString(array) {
  let tmp = '';
  let out = [];

  array.forEach(function (element) {
    tmp = '(\'';
    tmp += Object.values(element).join('\', \'');
    tmp += '\')';
    out.push(tmp);
  });

  return out.join(', ');
}

function selectColumns(table, columns, constraints, args, orderString) {
  let colString;
  let whereString = buildWhereString(constraints);

  if (typeof(columns) == 'undefined' || columns == null || columns.length == 0) {
    colString = '*';
  } else {
    colString = buildColumnsString(columns);
  }

  if (colString == '"*"') {
    colString = '*';
  }

  let selectString = 'SELECT ' + colString + ' FROM ' + table;

  selectString += whereString;

  if (typeof(orderString) == 'string') {
    selectString += ' ' + orderString;
  }

  if (typeof(args) !== 'undefined' && args != null) {
    return db.any(selectString, args);
  } else {
    return db.any(selectString);
  }

}

function selectUserInfo(userId) {
  return db.any('SELECT email_address, first_name, last_name FROM users WHERE id = $1', [userId])
    .then(function (rows) {
      return rows[0];
    });
}

function buildWhereString(constraints) {
  let out = '';
  if (Array.isArray(constraints) && constraints.length > 0) {
    out = ' WHERE ' + constraints.join(' AND ');
  } else if (typeof constraints === 'string') {
    out = ' WHERE ' + constraints;
  }
  return out;
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

function propFromRecords(propName, records) {
  let out = [];

  records.forEach(function (record) {
    out.push(record[propName]);
  });

  return out;
}

const publicUserProps = [
  'first_name',
  'last_name',
  'email_address',
  'profile_image'
];

function getUserInfoByEmail(email) {
  let columns = publicUserProps;
  columns.push('users.id');

  let selectString = 'SELECT ' + columns.join(', ') +
    ' FROM users WHERE email_address = $1';

  return db.any(selectString, [email])
    .then(function (rows) {
      return rows[0];
    })
}

function adminGetUserInfoByEmail(email) {
  let columns = publicUserProps;
  columns.push('users.id');

  let selectString = 'SELECT ' + columns.join(', ') +
    ' FROM users WHERE email_address = $1';
  return db.any(selectString, [email])
    .then(function (rows) {
      return rows[0];
    })
}

function getUsersInfo() {
  return db.any('SELECT ' + publicUserProps.join(', ') + ' FROM users');
}

function adminGetUsersInfo() {
  let adminVisibleUserProps = publicUserProps;
  adminVisibleUserProps.push('users.id');

  let selectString = 'SELECT ' +
    adminVisibleUserProps.join(', ') +
    ' FROM users';

  return db.any(selectString);
}

function adminFormatUsers(data) {
  let users = [];

  data.forEach(function (user) {
    users.push({
      first_name: user.first_name,
      last_name: user.last_name,
      email_address: user.email_address,
      profile_image: user.profile_image
    });
  });

  return { users: users };
}

function formatUsers(data) {
  let users = [];

  data.forEach(function (user) {
    users.push({
      first_name: user.first_name,
      last_name: user.last_name,
      email_address: user.email_address,
      profile_image: user.profile_image
    });
  });

  return { users: users };
}