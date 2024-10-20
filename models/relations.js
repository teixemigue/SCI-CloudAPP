const { sequelize } = require('../dB/database');
const { User } = require('./user'); 
const { Token } = require('./token'); 
const { Establishment } = require('./establishment'); 
const { Tank } = require('./tank');


User.hasMany(Token); 
Token.belongsTo(User); 
Token.belongsTo(Establishment); 

Establishment.hasMany(Tank);
Tank.belongsTo(Establishment);
Establishment.belongsTo(User);

module.exports = {sequelize,User, Establishment, Token , Tank};
