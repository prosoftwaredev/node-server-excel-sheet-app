'use strict';

const tableName = 'sheet_access_group';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return create(queryInterface, Sequelize);
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.dropTable(tableName);
  }
};

function create(queryInterface, Sequelize) {
  return queryInterface.createTable(
    tableName,
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      sheet_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      user_group_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
    },
    {
      charset: 'unicode' // default: null
    }
  )
}