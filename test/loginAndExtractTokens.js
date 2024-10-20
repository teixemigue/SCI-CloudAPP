const axios = require('axios');

const apiUrl = 'http://localhost:3000';  // API URL
const loginEndpoint = '/login';  // login endpoint
const tokensEndpoint = '/user/establishment/:establishmentId';  // Endpoint to fetch user tokens

const loginUser = async () => {
  try {
    const loginResponse = await axios.post(`${apiUrl}${loginEndpoint}`, {
      username: 'user',  // Change to the username you want to test
      password: 'userpass' // Change to the user's password
    });

    console.log('Login response:', loginResponse.data);  // Log the entire response

    return loginResponse.data; // Return the login response
  } catch (error) {
    console.error('Error logging in:', error.response ? error.response.data : error.message);
    throw error;  // Rethrow the error to stop further execution
  }
};

const fetchUserTokens = async (userId, establishmentId, token) => {
  try {
    const response = await axios.get(`${apiUrl}${tokensEndpoint.replace(':establishmentId', establishmentId)}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('User Tokens:', response.data); // Log the user tokens
  } catch (error) {
    console.error('Error fetching user tokens:', error.response ? error.response.data : error.message);
  }
};

const run = async () => {
  try {
    const data = await loginUser();  // Log in
    const accessToken = data.accessToken; // Assuming the token is returned in the response

    const userId = data.userId; // Assuming the userId is returned in the login response
    const establishmentId = 1; // Change to the establishment ID you want to query

    await fetchUserTokens(userId, establishmentId, accessToken); // Fetch user tokens with the access token
  } catch (error) {
    console.error('An error occurred during the process:', error.message);
  }
};

run();
