const { DataTypes } = require('sequelize');
const { sequelize } = require('../dB/database');

// TankTemperatureHistory Model
const TankTemperatureHistory = sequelize.define('TankTemperatureHistory', {
  tankId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Tanks',
      key: 'id'
    }
  },
  datetime: {
    type: DataTypes.DATE,
    allowNull: false
  },
  temperature: {
    type: DataTypes.FLOAT,
    allowNull: false
  }
});


module.exports = {TankTemperatureHistory};