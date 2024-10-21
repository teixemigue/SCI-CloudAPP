const { DataTypes } = require('sequelize');
const {sequelize} = require('../dB/database'); 

const Establishment = sequelize.define('Establishment', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  address: {
    type: DataTypes.STRING,
    allowNull: false
  },
  OwnerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users', 
      key: 'id'
    }
  }
});

module.exports = { Establishment };
