const { DataTypes } = require('sequelize');
const { sequelize } = require('../dB/database'); // Adjust the path as necessary

const EstablishmentStaff = sequelize.define('EstablishmentStaff', {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users', // Ensure this matches the correct model name
      key: 'id'
    }
  },
  establishmentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Establishments', // Ensure this matches the correct model name
      key: 'id'
    }
  }
}, {
  timestamps: true // This ensures createdAt and updatedAt fields are generated
});

module.exports = { EstablishmentStaff };
