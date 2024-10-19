const { sequelize, User } = require('./models/user');
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
    await User.bulkCreate([
      {
        username: 'admin',
        email: 'admin@example.com',
        password: hashedPassword1,  // Hashed password
        role: 'admin'  // Assign 'admin' role to Alice
      },
      {
        username: 'user',
        email: 'user@example.com',
        password: hashedPassword2,  // Hashed password
        role: 'user'  // Assign 'user' role to Bob
      }
    ]);

    console.log('Database seeded successfully!');
    process.exit(0);  // Exit the process successfully
  } catch (err) {
    console.error('Error seeding the database:', err);
    process.exit(1);  // Exit with failure
  }
};

seedDatabase();
