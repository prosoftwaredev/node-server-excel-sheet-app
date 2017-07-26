'use strict';

const tableName = 'files';
module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.addColumn(tableName, "sheet_id", {
      type: Sequelize.INTEGER,
      allowNull: false
    });
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.removeColumn(tableName, "sheet_id");
  }
};
