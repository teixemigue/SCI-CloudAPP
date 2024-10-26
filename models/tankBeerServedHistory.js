
const { DataTypes } = require('sequelize');
const { sequelize } = require('../dB/database'); 



const TankBeerServedHistory = sequelize.define('TankBeerServedHistory', {
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
    beerServed: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  });


module.exports = {TankBeerServedHistory};