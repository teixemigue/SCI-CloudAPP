const { sequelize} = require('./dB/database');
const {User} = require('./models/user')
const { Token} = require('./models/token');
const {Establishment} =require('./models/establishment');
const {Tank} = require('./models/tank');
const bcrypt = require('bcryptjs');

const seedDatabase = async () => {
  try {
    // Sync the database (force: true drops and recreates the tables)
    await sequelize.sync({ force: true });

    // Hash the passwords before inserting them
    const hashedPassword1 = await bcrypt.hash('admin', 10); 
    const hashedPassword2 = await bcrypt.hash('userpass', 10); 

    console.log('Hashed password for Admin:', hashedPassword1);

    // Insert some initial data with hashed passwords and roles
    const users = await User.bulkCreate([
      {
        username: 'admin',
        email: 'admin@example.com',
        password: hashedPassword1,  
        role: 'admin'  
      },
      {
        username: 'user',
        email: 'user@example.com',
        password: hashedPassword2, 
        role: 'user'  
      }
    ]);

    const adminUser = users[0];  
    const regularUser = users[1]; 

    // Insert some initial establishments
    const establishments = await Establishment.bulkCreate([
      {
        name: 'Beer Station A',
        address: 'Street of siga siga',
        OwnerId: adminUser.id
      },
      {
        name: 'Beer Station B',
        address: 'Street of good life',
        OwnerId: adminUser.id
      }
    ]);

    const establishmentA = establishments[0];  // First establishment
    const establishmentB = establishments[1];  // Second establishment

    // Insert some initial tokens for the users and establishments
    await Token.bulkCreate([
      {
        quantity: 100,
        status: 'Device',
        UserId: adminUser.id, 
        EstablishmentId: establishmentA.id  // Establishment A
      },
      {
        quantity: 50,
        status: 'Cup',
        UserId: regularUser.id, 
        EstablishmentId: establishmentA.id  // Establishment B
      }
    ]);

    await Tank.bulkCreate([
        {
          level: 1.0,
          beersServed: 0,
          beerPressure: 1, 
          Temp: 2.0,
          EstablishmentId: establishmentA.id
        },
        {
          level: 2.0,
          beersServed: 2,
          beerPressure: 2, 
          Temp: 20.0,
          EstablishmentId: establishmentB.id
        }
      ]);

    console.log('Database seeded successfully!');
    process.exit(0); 
  } catch (err) {
    console.error('Error seeding the database:', err);
    process.exit(1);  // Exit with failure
  }
};

seedDatabase();
