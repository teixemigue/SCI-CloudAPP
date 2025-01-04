const { DataTypes } = require('sequelize');
const {sequelize} = require('../dB/database');

const Confirmation = sequelize.define('Confirmation', {
  establishmentName: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: false
  },
  tokenId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Tokens', // Ensure this matches the correct model name
      key: 'id'
    }
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users', // Ensure this matches the correct model name
      key: 'id'
    }
  },
  usedAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
});

module.exports = { Confirmation };
