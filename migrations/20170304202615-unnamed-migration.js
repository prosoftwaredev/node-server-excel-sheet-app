'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return createCompanies(queryInterface, Sequelize);
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.dropTable('companies');
  }
};

function createCompanies(queryInterface, Sequelize) {
  return queryInterface.createTable(
    'companies',
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      logo_image: {
        type: Sequelize.STRING,
        allowNull: true
      },
    },
    {
      charset: 'unicode' // default: null
    }
  )
}