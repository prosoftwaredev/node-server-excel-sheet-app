'use strict';

const tableName = 'sheet_records';

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
      sheet_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      1: {
        type: Sequelize.STRING,
        allowNull: true
      },
      2: {
        type: Sequelize.STRING,
        allowNull: true
      },
      3: {
        type: Sequelize.STRING,
        allowNull: true
      },
      4: {
        type: Sequelize.STRING,
        allowNull: true
      },
      5: {
        type: Sequelize.STRING,
        allowNull: true
      },
      6: {
        type: Sequelize.STRING,
        allowNull: false
      },
      7: {
        type: Sequelize.STRING,
        allowNull: true
      },
      8: {
        type: Sequelize.STRING,
        allowNull: true
      },
      9: {
        type: Sequelize.STRING,
        allowNull: true
      },
      10: {
        type: Sequelize.STRING,
        allowNull: true
      },
    },
    {
      charset: 'unicode' // default: null
    }
  )
}