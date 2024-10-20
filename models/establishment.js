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
    allowNull: true
  }
});

module.exports = { Establishment };
