const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite' // Database location
});

const User = sequelize.define('User', {
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique:true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password: {  // Add password field
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {  // Add role field (for role-based access control)
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'user'  // Default role is 'user'
  }
});

module.exports = { sequelize, User };
