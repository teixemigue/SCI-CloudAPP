const { User } = require('../models/user');
const bcrypt = require('bcryptjs');  // For hashing passwords
const jwt = require('jsonwebtoken');  // For JWT tokens
const config = require('../auth/auth.json');
const accessKey = config.accessKey;
const refreshKey = config.refreshKey;



// Get all users
const getUsers = async (req, res) => {
  try {
    const users = await User.findAll();
    res.status(200).json(users);
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

module.exports = { getUsers, createUser, loginUser };
