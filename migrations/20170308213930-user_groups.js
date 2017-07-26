'use strict';

const tableName = 'user_groups';

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
      created_date_time: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      updated_date_time: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      description: {
        type: Sequelize.STRING,
        allowNull: false
      },
    },
    {
      charset: 'unicode' // default: null
    }
  )
}