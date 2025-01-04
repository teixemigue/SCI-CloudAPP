const { sequelize } = require('./dB/database');
const { User } = require('./models/user');
const { Token } = require('./models/token');
const { Establishment } = require('./models/establishment');
const { Tank } = require('./models/tank');
const { EstablishmentStaff } = require('./models/establishmentStaff');
const { TankTemperatureHistory } = require('./models/tankTemperatureHistory');
const { TankBeerServedHistory } = require('./models/tankBeerServedHistory');
const { TankLevelHistory } = require('./models/tankLevelHistory');
const {Confirmation} = require('./models/confirmation');
const {Request} = require('./models/request');
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

    // Create Establishments with realistic data
    const establishments = await Establishment.bulkCreate([
      {
        name: 'The Hoppy Brewer',
        address: '123 Craft Beer St',
        price: 8.50
      },
      {
        name: 'Beer Garden Central',
        address: '456 Pub Lane',
        price: 7.00
      },
      {
        name: 'Brewery & Co.',
        address: '789 Ale Avenue',
        price: 9.00
      }
    ]);

    // Create EstablishmentStaff relationships
    await EstablishmentStaff.bulkCreate([
      { userId: adminUser.id, establishmentId: establishments[0].id, role: 'owner' },
      { userId: adminUser.id, establishmentId: establishments[1].id, role: 'owner' },
      { userId: regularUser.id, establishmentId: establishments[0].id, role: 'staff' }
    ]);

    // Create some initial tokens
    const tokens = [];
    const tokenStatuses = ['Active', 'Device', 'Cup'];
    for (let i = 0; i < 10; i++) {
      tokens.push({
        status: tokenStatuses[Math.floor(Math.random() * tokenStatuses.length)],
        UserId: i % 2 === 0 ? adminUser.id : regularUser.id,
        EstablishmentId: establishments[Math.floor(Math.random() * establishments.length)].id
      });
    }
    await Token.bulkCreate(tokens);

    // Create Tanks for each establishment
    const tanks = await Tank.bulkCreate([
      {
        level: 0.85,
        beersServed: 150,
        Temp: 3.0,
        EstablishmentId: establishments[0].id
      },
      {
        level: 0.92,
        beersServed: 80,
        Temp: 2.8,
        EstablishmentId: establishments[0].id
      },
      {
        level: 0.76,
        beersServed: 220,
        Temp: 3.2,
        EstablishmentId: establishments[1].id
      }
    ]);

    // Create sample dates for the last 30 days with multiple entries per day
    const dates = [];
    for (let i = 0; i < 10; i++) {
      for (let hour = 0; hour < 12; hour++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(hour, 0, 0, 0);
        dates.push(date);
      }
    }

    // Your existing helper functions
    const generateTemperature = (baseTemp, hour) => {
      const timeVariation = Math.sin(hour * Math.PI / 12) * 0.5;
      const randomVariation = (Math.random() - 0.5) * 0.3;
      return baseTemp + timeVariation + randomVariation;
    };

    const generateBeerServed = (hour, dayOfWeek) => {
      let baseAmount = 0;
      const isWeekend = dayOfWeek === 5 || dayOfWeek === 6; // Friday or Saturday
      
      if (hour >= 12 && hour <= 15) { // Lunch
        baseAmount = Math.floor(Math.random() * 10) + (isWeekend ? 10 : 5);
      } else if (hour >= 17 && hour <= 23) { // Evening
        baseAmount = Math.floor(Math.random() * 20) + (isWeekend ? 15 : 10);
      } else if (hour >= 0 && hour <= 2) { // Late night
        baseAmount = Math.floor(Math.random() * 15) + (isWeekend ? 10 : 5);
      } else { // Other times
        baseAmount = Math.floor(Math.random() * 5);
      }
      return baseAmount;
    };

    // Initialize tank levels
    let tankLevels = tanks.map(() => 1.0);

    // Create histories for each tank
    for (const date of dates) {
      const dayOfWeek = date.getDay();
      
      for (let tankIndex = 0; tankIndex < tanks.length; tankIndex++) {
        const tank = tanks[tankIndex];
        const beerServed = generateBeerServed(date.getHours(), dayOfWeek);
        
        // Update tank level
        tankLevels[tankIndex] -= beerServed * 0.002;
        if (tankLevels[tankIndex] < 0.2 && Math.random() < 0.8) {
          tankLevels[tankIndex] = 1.0; // Refill
        }
        tankLevels[tankIndex] = Math.max(0.1, Math.min(1.0, tankLevels[tankIndex]));

        await Promise.all([
          TankTemperatureHistory.create({
            tankId: tank.id,
            datetime: date,
            temperature: generateTemperature(3.0, date.getHours())
          }),
          TankBeerServedHistory.create({
            tankId: tank.id,
            datetime: date,
            beerServed: beerServed
          }),
          TankLevelHistory.create({
            tankId: tank.id,
            datetime: date,
            level: tankLevels[tankIndex]
          })
        ]);
      }
    }

    const requestMocks = [
      {
        "id": 1,
        "status": "pending",
        "tokenId": 1,
        "userId": 1,
        "createdAt": "2025-01-03T08:30:00Z",
        "updatedAt": "2025-01-03T09:15:00Z"
      },
      {
        "id": 2,
        "status": "pending",
        "tokenId": 3,
        "userId": 1,
        "createdAt": "2025-01-03T08:30:00Z",
        "updatedAt": "2025-01-03T09:15:00Z"
      }
    ]

    try {
      await Request.bulkCreate(requestMocks);
      console.log('Mock requests seeded successfully!');
    } catch (error) {
      console.error('Error seeding mock requests:', error);
    }

    // Mock data for confirmations
    const mockConfirmations = [
      {
        establishmentName: 'The Hoppy Brewer',
        tokenId: 1, // Assuming this token ID exists
        userId: 1, // Assuming this user ID exists
        usedAt: null // Current date and time
      },
      {
        establishmentName: 'Beer Garden Central',
        tokenId: 3, // Assuming this token ID exists
        userId: 1, // Assuming this user ID exists
        usedAt: null // 1 day ago
      }
    ];

    try {
      await Confirmation.bulkCreate(mockConfirmations);
      console.log('Mock confirmations seeded successfully!');
    } catch (error) {
      console.error('Error seeding mock confirmations:', error);
    }
   


    console.log('Database seeded with realistic mock data!');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding the database:', err);
    process.exit(1);
  }
};

seedDatabase();
