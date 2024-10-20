const { DataTypes } = require('sequelize');
const { sequelize } = require('../dB/database'); // Adjust path as necessary

// Define the Token model
const Token = sequelize.define('Token', {
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  status:{
    type:DataTypes.STRING,
    allowNull: false
  },
  UserId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users', 
      key: 'id'
    }
  },
  EstablishmentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Establishments', 
      key: 'id'
    }
  }
});

module.exports = { Token };
