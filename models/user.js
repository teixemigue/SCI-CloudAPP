const { DataTypes } = require('sequelize');
const {sequelize} = require('../dB/database'); // Adjust path as necessary


// Define the User model
const User = sequelize.define('User', {
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password: {  
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {  
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'user'  
  }
});




module.exports = { User };
