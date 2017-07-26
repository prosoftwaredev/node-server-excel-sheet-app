'use strict';

const tableName = 'users';
module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.changeColumn(tableName, "profile_image", {
      type: Sequelize.STRING,
      allowNull: true
    });
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.changeColumn(tableName, "profile_image", {
      type: Sequelize.STRING,
      allowNull: false
    });
  }
};
