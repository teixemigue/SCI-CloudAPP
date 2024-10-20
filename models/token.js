const { DataTypes } = require('sequelize');
const { sequelize } = require('../dB/database'); // Adjust path as necessary

// Define the Token model
const Token = sequelize.define('Token', {
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  UserId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users', // Assuming your user table is named 'Users'
      key: 'id'
    }
  },
  EstablishmentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Establishments', // Assuming your establishment table is named 'Establishments'
      key: 'id'
    }
  }
});

module.exports = { Token };
