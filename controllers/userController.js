
const {User,Token,Establishment} = require('../models/relations')
const bcrypt = require('bcryptjs');  // For hashing passwords
const jwt = require('jsonwebtoken');  // For JWT tokens
const config = require('../auth/auth.json');
const accessKey = config.accessKey;
const refreshKey = config.refreshKey;



// Get all users info
const getUsers = async (req, res) => {
    try {
      const users = await User.findAll({
        attributes: ['id', 'username', 'email', 'role', 'createdAt', 'updatedAt'],
        include: [{
          model: Token,
          attributes: ['id', 'quantity', 'EstablishmentId', 'createdAt', 'updatedAt']
        }]
      });
  
      const formattedUsers = users.map(user => ({
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        tokens: user.Tokens.map(token => ({
          id: token.id,
          quantity: token.quantity,
          establishmentId: token.EstablishmentId,
          createdAt: token.createdAt,
          updatedAt: token.updatedAt
        }))
      }));
  
      // Log detailed information
      console.log('User Info:');
      formattedUsers.forEach(user => {
        console.log(`User: ${user.username}, Tokens:`);
        user.tokens.forEach(token => {
          console.log(`  - Token ID: ${token.id}, Quantity: ${token.quantity}, Establishment ID: ${token.establishmentId}, Created At: ${token.createdAt}`);
        });
      });
  
      res.status(200).json(formattedUsers);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  };
  
  

// Create a new user with hashed password
const createUser = async (req, res) => {
  const { username, email, password, role } = req.body;

  try {
    // Hash the password before saving the user
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,  // Store hashed password
      role  // e.g., 'user' or 'admin'
    });

    res.status(201).json(newUser);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create user' });
  }
};

// Login user and generate JWT token
const loginUser = async (req, res) => {
  const { username, password } = req.body;

  try {
    // Find user by email
    const user = await User.findOne({ where: { username } });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if the password is correct
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const accessToken = jwt.sign(
      { userId: user.id, role: user.role },  // Store user ID and role in the token
      accessKey,
      { expiresIn: '15m' }  // Token expires in 1 hour
    );

    const refreshToken = jwt.sign(
        { userId: user.id, role: user.role },  // Store user ID and role in the token
        refreshKey,
        { expiresIn: '30m' }  // Token expires in 1 hour
    );

    // Send token as the response
    res.json({ accessToken:accessToken, refreshToken:refreshToken});
  } catch (err) {
    res.status(500).json({ error: 'Login failed' });
  }
};

  
 

const getUserTokensForEstablishment = async (req, res) => {
    const { establishmentId } = req.params;
    const userId = req.user.userId; 
   
    if (!userId || !establishmentId) {
      return res.status(400).json({ message: 'User ID and Establishment ID are required' });
    }
  
    try {
      const tokens = await Token.findAll({
        where: {
          UserId: userId,  // Use the userId from request parameters
          EstablishmentId: establishmentId
        },
        include: [Establishment] // Include the Establishment model
      });
  
      res.json(tokens);
    } catch (error) {
      console.error('Error fetching tokens:', error);
      res.status(500).json({ message: 'Error fetching tokens', error });
    }
  };
  
module.exports = { getUsers, createUser, loginUser ,getUserTokensForEstablishment};
