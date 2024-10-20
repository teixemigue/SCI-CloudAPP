const axios = require('axios');

const apiUrl = 'http://localhost:3000';  // API URL
const loginEndpoint = '/login';  // login endpoint
const usersInfoEndpoint = '/info/users';  // Endpoint to fetch user info

const loginUser = async () => {
  try {
    const loginResponse = await axios.post(`${apiUrl}${loginEndpoint}`, {
      username: 'admin',  
      password: 'admin'   
    });

    console.log('Login response:', loginResponse.data);  // Log the entire response

    return loginResponse.data;
  } catch (error) {
    console.error('Error logging in:', error.response ? error.response.data : error.message);
    throw error;  // Rethrow the error to stop further execution
  }
};

const fetchUserInfo = async (token) => {
  try {
    const response = await axios.get(`${apiUrl}${usersInfoEndpoint}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    
    logUserResponse(response.data);
} catch (error) {
    console.error('Error fetching user info:', error.response ? error.response.data : error.message);
  }
};

const run = async () => {
  try {
     // Log the entire response
    const data = await loginUser();  //Log in
    const refreshToken = data.refreshToken;
    const accessToken = data.accessToken;

    await fetchUserInfo(accessToken).data; //Fetch user info with the acess token
    
  } catch (error) {
    console.error('An error occurred during the process:', error.message);
  }
};

const logUserResponse = (users) => {
    // Check if users is valid and contains data
    if (!Array.isArray(users) || users.length === 0) {
      console.log('No users found or invalid data format.');
      return;
    }
  
    // Log detailed user information
    users.forEach(user => {
      console.log(`User: ${user.username}, ID: ${user.id}`);
      
      if (user.tokens && user.tokens.length > 0) {
        
        console.log('Tokens:');
        user.tokens.forEach(token => {
          console.log(`  - Token ID: ${token.id}, Quantity: ${token.quantity}, Establishment ID: ${token.establishmentId}, Created At: ${token.createdAt}`);
        });
      } else {
        console.log('  No tokens found for this user.');
      }
    });
  };
  
  

run();
