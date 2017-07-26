const db = require('../config/db');
const userUtils = require('./user_utils');

const tableName = 'user_groups';
const membersTable = 'group_member';

module.exports = {
  getAll: getAll,
  getUserGroup: getUserGroup,
  updateUserGroup: updateUserGroup,
  createUserGroup: createUserGroup,
  addMember: addMember,
  removeMember: removeMember,
  deleteUserGroup: deleteUserGroup,
  checkUserGroupExists: checkUserGroupExists,
  checkMultipleUserGroupsExist: checkMultipleUserGroupsExist,
  addMultipleUsersToGroup: addMultipleUsersToGroup,
  addSingleUserToMultipleGroups: addSingleUserToMultipleGroups,
};

function getAll() {
  return db.selectColumns(tableName);
}

function getUserGroup(user_group_id) {
  return db.selectColumns(tableName, ['*'], ['id = ' + user_group_id])
    .then(function (rows) {
      return rows.pop();
    });
}

function updateUserGroup(user_group_id, updatedUserGroup) {
  let timeStamp = new Date().toISOString();
  updatedUserGroup.updated_date_time = timeStamp;
  return checkUserGroupExists(user_group_id)
    .then(function() {
      return db.updateById(tableName, updatedUserGroup, user_group_id)
        .then(function () {
          return getUserGroup(user_group_id);
        });
    });
}

function addMember(newMember) {
  return checkUserGroupExists(newMember.user_group_id)
    .then(function() {
      return userUtils.checkUserExists(newMember.user_id)
        .then(function () {
          return db.insertArrayIgnoreConflicts(membersTable, [newMember], membersTableConflictTargets);
        });
    });
}

function removeMember(user_group_id, user_id) {
  return db.deleteFrom(membersTable, 'user_id = $1 AND user_group_id = $2', [user_id, user_group_id]);
}

function createUserGroup(newUserGroup) {
  let timeStamp = new Date().toISOString();
  newUserGroup.created_date_time = timeStamp;
  newUserGroup.updated_date_time = timeStamp;
  return db.insertReturnIds(tableName, newUserGroup)
    .then(function (rows) {
      let id = rows[0].id;
      return getUserGroup(id);
    });
}

function deleteUserGroup(user_group_id) {
  if (user_group_id == undefined || user_group_id == null || typeof user_group_id != 'number') {
    return Promise.reject('invalid user_group_id');
  }

  return checkUserGroupExists(user_group_id)
    .then(function() {
      return db.deleteFrom(tableName, ['id = ' + user_group_id]);
    });
}

function checkUserGroupExists(user_group_id) {
  if (user_group_id == undefined || user_group_id == null || typeof user_group_id != 'number') {
    return Promise.reject('invalid user_group_id');
  }

  return db.selectColumns(tableName, ['id'], ['id = ' + user_group_id])
    .then(function (rows) {
      if (rows.length == 0) {
        throw('requested user_group does not exist');
      }
    });
}

function checkMultipleUserGroupsExist(userGroupIds) {
  if (userGroupIds.length == 0) {
    return Promise.reject('invalid userGroupIds');
  }

  let uniqueUserGroupIds = [...new Set(userGroupIds)];

  for (let i = 0; i< uniqueUserGroupIds.length; i++) {
    let user_group_id = uniqueUserGroupIds[i];
    if (user_group_id == undefined || user_group_id == null || typeof user_group_id != 'number') {
      return Promise.reject('invalid user_group_id');
    }
  }

  return db.selectColumns(tableName, ['id'], ['id IN (' + uniqueUserGroupIds.join(', ') + ')'])
    .then(function (rows) {
      if (rows.length != uniqueUserGroupIds.length) {
        throw('one or more requested user groups does not exist');
      }
    });
}

const membersTableConflictTargets = ['user_id', 'user_group_id'];

function addMultipleUsersToGroup(userIds, user_group_id) {
  return checkUserGroupExists(user_group_id)
    .then(function() {
      return userUtils.checkMultipleUsersExist(userIds)
        .then(function () {
          let newMembers = [];
          let uniqueUserIds = [...new Set(userIds)];
          for (let i = 0; i< uniqueUserIds.length; i++) {
            let tmpMember = {
              user_id: uniqueUserIds[i],
              user_group_id: user_group_id
            };
            newMembers.push(tmpMember);
          }
          return db.insertArrayIgnoreConflicts(membersTable, newMembers, membersTableConflictTargets);
        });
    });
}

function addSingleUserToMultipleGroups(user_id, userGroupIds) {
  return userUtils.checkUserExists(user_id)
    .then(function() {
      return checkMultipleUserGroupsExist(userGroupIds)
        .then(function () {
          let newMembers = [];
          let uniqueUserGroupIds = [...new Set(userGroupIds)];
          for (let i = 0; i< uniqueUserGroupIds.length; i++) {
            let tmpMember = {
              user_id: user_id,
              user_group_id: uniqueUserGroupIds[i]
            };
            newMembers.push(tmpMember);
          }
          return db.insertArrayIgnoreConflicts(membersTable, newMembers, membersTableConflictTargets);
        });
    });
}
