const { DataTypes } = require('sequelize');
const { sequelize } = require('../dB/database');

// Define the Token model
const Tank = sequelize.define('Tank', {
  level: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0.0
  },
  beersServed:{
    type:DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0
  },
  temp:{
    type:DataTypes.FLOAT,
    allowNull:true,
    defaultValue: 0.0
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


module.exports = { Tank };
