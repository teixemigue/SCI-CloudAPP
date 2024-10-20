const { sequelize } = require('../dB/database');
const { User } = require('./user'); // Pass sequelize instance
const { Token } = require('./token'); // Pass sequelize instance
const { Establishment } = require('./establishment'); // Pass sequelize instance

// Define associations
User.hasMany(Token); // A user can have many tokens
Token.belongsTo(User); // A token belongs to a user
Token.belongsTo(Establishment); // A token belongs to an establishment

// Export everything
module.exports = {sequelize,User, Establishment, Token };
