'use strict';

const tableName = 'record_comments';

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
      sheet_record_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      body: {
        type: Sequelize.STRING,
        allowNull: true
      },
    },
    {
      charset: 'unicode' // default: null
    }
  )
}