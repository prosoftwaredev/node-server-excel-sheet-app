'use strict';

const tableName = 'users';

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
      email_address: {
        type: Sequelize.STRING,
        allowNull: false
      },
      first_name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      last_name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      profile_image: {
        type: Sequelize.STRING,
        allowNull: false
      },
      encrypted_password: {
        type: Sequelize.STRING,
        allowNull: false
      },
      reset_string: {
        type: Sequelize.STRING,
        allowNull: true
      },
      is_disabled: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      is_admin: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      has_set_first_pw: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
    },
    {
      charset: 'unicode' // default: null
    }
  )
}