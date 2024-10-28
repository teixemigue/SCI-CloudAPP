const { sequelize } = require('../dB/database');
const { User } = require('./user'); 
const { Token } = require('./token'); 
const { Establishment } = require('./establishment'); 
const { Tank } = require('./tank');
const { EstablishmentStaff } = require('./establishmentStaff');
const { TankTemperatureHistory } = require('./tankTemperatureHistory');
const { TankBeerServedHistory } = require('./tankBeerServedHistory');
const { TankLevelHistory } = require('./tankLevelHistory');

// Token relationships
User.hasMany(Token);
Token.belongsTo(User);
Token.belongsTo(Establishment);

// Establishment and Tank relationships
Establishment.hasMany(Tank);
Tank.belongsTo(Establishment);

// Many-to-many relationship through EstablishmentStaff
User.belongsToMany(Establishment,{ through: EstablishmentStaff });
Establishment.belongsToMany(User,{ through: EstablishmentStaff });

EstablishmentStaff.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(EstablishmentStaff, { foreignKey: 'userId' });


// Tank and historical data relationships
Tank.hasMany(TankTemperatureHistory);
Tank.hasMany(TankLevelHistory);
Tank.hasMany(TankBeerServedHistory);

TankTemperatureHistory.belongsTo(Tank);
TankLevelHistory.belongsTo(Tank);
TankBeerServedHistory.belongsTo(Tank);

// Export models and sequelize connection
module.exports = { sequelize, User, Establishment, Token, Tank, EstablishmentStaff, TankTemperatureHistory, TankLevelHistory, TankBeerServedHistory };
