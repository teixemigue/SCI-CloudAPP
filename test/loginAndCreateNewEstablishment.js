const axios = require('axios');

const apiUrl = 'http://localhost:3000';  // API URL
const loginEndpoint = '/login';  // login endpoint
const addEstablishmentEndpoint = '/user/establishment/create';  // Establishment creation endpoint

// Function to log in the user and get the token
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

// Function to add a new establishment using the token
const addEstablishment = async (token) => {
  try {
    const response = await axios.post(`${apiUrl}${addEstablishmentEndpoint}`, {
      name: 'Mars Research Center',  // Change this to the name of the establishment you want to add
      location: 'Mars Colony Zone 1' // Change this to the location of the establishment
    }, {
      headers: {
        Authorization: `Bearer ${token}`,  // Passing the token in the headers
        'Content-Type': 'application/json'
      }
    });

    console.log('Establishment creation response:', response.data);  // Log the response from adding the establishment
  } catch (error) {
    console.error('Error adding establishment:', error.response ? error.response.data : error.message);
  }
};

// Main function to run the script
const run = async () => {
  try {
    const data = await loginUser();  // Log in to get the token
    const accessToken = data.accessToken; // Assuming the token is returned in the response

    await addEstablishment(accessToken);  // Add the new establishment using the access token
  } catch (error) {
    console.error('An error occurred during the process:', error.message);
  }
};

// Run the script
run();
