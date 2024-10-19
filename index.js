const { sequelize } = require('./models/user');
const express = require('express');
const bodyParser = require('body-parser');
const userRoutes = require('./routes/userRoutes');
const tokenRoutes = require('./routes/tokenRoutes')




sequelize.sync({ force: false }).then(() => {
  console.log('Database synced');
}).catch((err) => {
  console.log('Error syncing database: ', err);
});




const app = express();
app.use(bodyParser.json());  // Parse JSON request bodies

// Routes
app.use('/', userRoutes);
app.use('/token',tokenRoutes);
// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
