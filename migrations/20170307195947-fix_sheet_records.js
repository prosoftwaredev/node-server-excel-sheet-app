'use strict';

const tableName = 'sheet_records';
module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.changeColumn(tableName, "6", {
      type: Sequelize.STRING,
      allowNull: true
    });
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.changeColumn(tableName, "6", {
      type: Sequelize.STRING,
      allowNull: false
    });
  }
};
