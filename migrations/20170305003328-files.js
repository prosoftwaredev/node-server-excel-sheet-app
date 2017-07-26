'use strict';

const tableName = 'files';

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
      serving_path: {
        type: Sequelize.STRING,
        allowNull: false
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