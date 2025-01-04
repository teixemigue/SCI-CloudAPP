const { DataTypes } = require('sequelize');
const { sequelize } = require('../dB/database');

// Define the Token model
const Request = sequelize.define('Request', {
  status:{
    type:DataTypes.STRING,
    allowNull: false,
    defaultValue: 0
  },
  tokenId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Tokens', 
      key: 'id'
    }
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
        model: 'Users',
        key: 'id'
    }
  }
});


module.exports = { Request };
