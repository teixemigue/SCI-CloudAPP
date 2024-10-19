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

    console.log('User Info:', response.data);
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

    await fetchUserInfo(accessToken); //Fetch user info with the acess token
  } catch (error) {
    console.error('An error occurred during the process:', error.message);
  }
};

run();
