'use strict';
const tableName = 'group_member';
const indexColumns = ['user_id', 'user_group_id'];

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.addIndex(
      tableName,
      indexColumns,
      {
        indicesType: 'UNIQUE'
      }
    )
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.removeIndex(
      tableName,
      indexColumns
    )
  }
};
