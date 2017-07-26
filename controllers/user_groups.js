const groupUtils = require('../utils/group_utils');
const controllerUtils = require('../utils/controller_utils');

module.exports = {
  create: create,
  get: get,
  index: index,
  update: update,
  addMember: addMember,
  removeMember: removeMember,
  deleteUserGroup: deleteUserGroup,
  addMultipleMembersToGroup: addMultipleMembersToGroup,
  addSingleMemberToMultipleGroups: addSingleMemberToMultipleGroups,
};

function index(req, res) {
  return groupUtils.getAll()
    .then(controllerUtils.respondWithRecord(res))
    .catch(controllerUtils.errorHandler(res, 404));
}

function create(req, res) {
  let name = req.body.name;
  let description = req.body.description;

  let newUserGroup = {
    name: name,
    description: description,
  };

  return groupUtils.createUserGroup(newUserGroup)
    .then(controllerUtils.respondWithRecord(res))
    .catch(controllerUtils.errorHandler(res, 422));
}

function get(req, res) {
  let id = req.query.id;

  return groupUtils.getUserGroup(id)
    .then(controllerUtils.respondWithRecord(res))
    .catch(controllerUtils.errorHandler(res, 404));
}

function update(req, res) {
  let user_group_id = req.body.id;
  let name = req.body.name;
  let description = req.body.description;

  let updatedUserGroup = {
    name: name,
    description: description,
  };

  return groupUtils.updateUserGroup(user_group_id, updatedUserGroup)
    .then(controllerUtils.respondWithRecord(res))
    .catch(controllerUtils.errorHandler(res, 422));
}

function addMember(req, res) {
  let user_group_id = req.body.id;
  let user_id = req.body.user_id;

  let newMember = {
    user_group_id: user_group_id,
    user_id: user_id
  };

  return groupUtils.addMember(newMember)
    .then(controllerUtils.blankResponse(res))
    .catch(controllerUtils.errorHandler(res, 422));
}

function addMultipleMembersToGroup(req, res) {
  let user_group_id = req.body.user_group_id;
  let userIds = req.body.user_ids;

  return groupUtils.addMultipleUsersToGroup(userIds, user_group_id)
    .then(controllerUtils.blankResponse(res))
    .catch(controllerUtils.errorHandler(res, 422));
}

function addSingleMemberToMultipleGroups(req, res) {
  let userGroupIds = req.body.user_group_ids;
  let user_id = req.body.user_id;

  return groupUtils.addSingleUserToMultipleGroups(user_id, userGroupIds)
    .then(controllerUtils.blankResponse(res))
    .catch(controllerUtils.errorHandler(res, 422));
}

function removeMember(req, res) {
  let user_group_id = req.body.id;
  let user_id = req.body.user_id;

  return groupUtils.removeMember(user_group_id, user_id)
    .then(controllerUtils.blankResponse(res))
    .catch(controllerUtils.errorHandler(res, 422));
}

function deleteUserGroup(req, res) {
  let user_group_id = req.body.id;

  return groupUtils.deleteUserGroup(user_group_id)
    .then(controllerUtils.blankResponse(res))
    .catch(controllerUtils.errorHandler(res, 404));
}
