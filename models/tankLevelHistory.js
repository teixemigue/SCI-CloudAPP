const { DataTypes } = require('sequelize');
const { sequelize } = require('../dB/database'); 


const TankLevelHistory = sequelize.define('TankLevelHistory', {
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
    level: {
      type: DataTypes.FLOAT,
      allowNull: false
    }
  });


module.exports = {TankLevelHistory};