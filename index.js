const { sequelize } = require('./dB/database');
const express = require('express');
const bodyParser = require('body-parser');
const userRoutes = require('./routes/userRoutes');
const tokenRoutes = require('./routes/tokenRoutes');
const statisticsRoutes = require('./routes/statisticsRoutes');
const confirmationRoutes = require('./routes/machineTokenRoutes');


const PORT = process.env.PORT || 3000;





const app = express();
app.use(bodyParser.json());  // Parse JSON request bodies




// Routes
app.use('/', userRoutes);
app.use('/token',tokenRoutes);
app.use('/statistics',statisticsRoutes);
app.use('/confirmations',confirmationRoutes);
// Start the server



const startServer = async () => {
    try {
      await sequelize.authenticate(); // Test the connection
      console.log('Database connection established successfully.');
      
      await sequelize.sync(); // Sync models
      console.log('Models synced successfully.');
  
      app.listen(PORT, () => {
        console.log(`Server is running on ${PORT}`);
      });
    } catch (error) {
      console.error('Unable to connect to the database:', error);
    }
  };


startServer();