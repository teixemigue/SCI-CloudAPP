const { sequelize } = require('./dB/database');
const { User } = require('./models/user');
const { Token } = require('./models/token');
const { Establishment } = require('./models/establishment');
const { Tank } = require('./models/tank');
const { EstablishmentStaff } = require('./models/establishmentStaff');
const { TankTemperatureHistory } = require('./models/tankTemperatureHistory');
const { TankBeerServedHistory } = require('./models/tankBeerServedHistory');
const { TankLevelHistory } = require('./models/tankLevelHistory');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const seedDatabase = async () => {
  try {
    const force = process.argv.includes('--force');
    console.log('Force mode:', force);

    if (force) {
      console.log('Forcing database reset...');
      await sequelize.sync({ force: true });
    } else {
      const dbFilePath = path.join(__dirname, 'database.sqlite');
      
      // Only sync (without force) if the database exists
      if (fs.existsSync(dbFilePath)) {
        await sequelize.sync({ force: false });
        console.log('Database exists, synced without forcing.');
        return;
      }

      // If database doesn't exist, create it and seed
      await sequelize.sync({ force: true });
    }

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
        price: 10.00 // Make sure to include price since it's in your model
      },
      {
        name: 'Beer Station B',
        address: 'Street of good life',
        price: 12.50 // Make sure to include price since it's in your model
      }
    ]);

    const establishmentA = establishments[0];  // First establishment
    const establishmentB = establishments[1];  // Second establishment

    await EstablishmentStaff.bulkCreate([
      { userId: adminUser.id, establishmentId: establishmentA.id , role:'owner'},
      { userId: adminUser.id, establishmentId: establishmentB.id ,role:'owner'},
      { userId: regularUser.id, establishmentId: establishmentA.id, role:'staff'},
    ]);

    // Insert some initial tokens for the users and establishments
    await Token.bulkCreate([
      {
        status: 'Device',
        UserId: adminUser.id, 
        EstablishmentId: establishmentA.id  // Establishment A
      },
      {
        status: 'Cup',
        UserId: regularUser.id, 
        EstablishmentId: establishmentA.id  // Establishment A
      }
    ]);

    await Tank.bulkCreate([
      {
        level: 1.0,
        beersServed: 0,
        Temp: 2.0,
        EstablishmentId: establishmentA.id
      },
      {
        level: 2.0,
        beersServed: 2,
        Temp: 20.0,
        EstablishmentId: establishmentB.id
      }
    ]);

    // Create sample dates for the last 7 days
    const dates = [...Array(7)].map((_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date;
    });

    // Seed temperature history
    await TankTemperatureHistory.bulkCreate(
      dates.flatMap(date => [
        {
          tankId: 1, // Assuming this corresponds to Tank A
          datetime: date,
          temperature: 2.0 + Math.random() * 2 // Random between 2-4°C
        },
        {
          tankId: 2, // Assuming this corresponds to Tank B
          datetime: date,
          temperature: 3.0 + Math.random() * 2 // Random between 3-5°C
        }
      ])
    );

    // Seed beer served history
    await TankBeerServedHistory.bulkCreate(
      dates.flatMap(date => [
        {
          tankId: 1, // Assuming this corresponds to Tank A
          datetime: date,
          beerServed: Math.floor(Math.random() * 50) // Random 0-50 beers
        },
        {
          tankId: 2, // Assuming this corresponds to Tank B
          datetime: date,
          beerServed: Math.floor(Math.random() * 50) // Random 0-50 beers
        }
      ])
    );

    // Seed level history
    await TankLevelHistory.bulkCreate(
      dates.flatMap(date => [
        {
          tankId: 1, // Assuming this corresponds to Tank A
          datetime: date,
          level: 0.7 + Math.random() * 0.3 // Random between 70-100%
        },
        {
          tankId: 2, // Assuming this corresponds to Tank B
          datetime: date,
          level: 0.6 + Math.random() * 0.4 // Random between 60-100%
        }
      ])
    );

    console.log('Database seeded successfully!');
    process.exit(0); 
  } catch (err) {
    console.error('Error seeding the database:', err);
    process.exit(1);  // Exit with failure
  }
};

seedDatabase();
