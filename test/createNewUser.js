const axios = require('axios');

const apiUrl = 'http://localhost:3000';  // Change this to your actual API URL
const registerEndpoint = '/register';    // Adjust if your route differs

// Sample user data for registration
const userData = {
  username: 'newUser123',
  email: 'newuser123@example.com',
  password: 'securePassword',  // Plain password to be hashed
  role: 'admin',               // Can be 'user' or 'admin'
  key: 'adminAccess'          // Required if the role is 'admin'
};

// Function to register a new user
const registerUser = async () => {
  try {
    const response = await axios.post(`${apiUrl}${registerEndpoint}`, userData);

    console.log('User registered successfully:', response.data); // Success response
  } catch (error) {
    if (error.response) {
      // Server-side error
      console.error('Error registering user:', error.response.data);
    } else {
      // Client-side or network error
      console.error('Error:', error.message);
    }
  }
};

// Run the user registration
registerUser();
