const axios = require('axios');

const apiUrl = 'http://localhost:3000'; // Replace with your actual API URL
const loginEndpoint = '/login'; // Login endpoint
const tokenId = 2; // Replace with a valid token ID you want to test
const addQuantity = 5; // Quantity to add
const subtractQuantity = 2; // Quantity to subtract

const loginUser = async () => {
    try {
        const response = await axios.post(`${apiUrl}${loginEndpoint}`, {
            username: 'user',  // Replace with your test username
            password: 'userpass' // Replace with the corresponding password
        });
        return response.data.accessToken; // Return the access token
    } catch (error) {
        console.error('Error logging in:', error.response ? error.response.data : error.message);
        throw error; // Rethrow error for further handling
    }
};

const testTokenOperations = async (token) => {
    try {
        // Test adding token quantity
        console.log('Adding token quantity...');
        const addResponse = await axios.post(`${apiUrl}/user/token/add/${tokenId}`, {
            additionalQuantity: addQuantity
        }, {
            headers: {
                Authorization: `Bearer ${token}`, // Use the access token
                'Content-Type': 'application/json'
            }
        });

        console.log('Add Response:', addResponse.data); // Log the response

        // Test subtracting token quantity
        console.log('Subtracting token quantity...');
        const subtractResponse = await axios.post(`${apiUrl}/user/token/subtract/${tokenId}`, {
            quantityToSubtract: subtractQuantity
        }, {
            headers: {
                Authorization: `Bearer ${token}`, // Use the access token
                'Content-Type': 'application/json'
            }
        });

        console.log('Subtract Response:', subtractResponse.data); // Log the response

    } catch (error) {
        console.error('Error during token operations:', error.response ? error.response.data : error.message);
    }
};

// Main function to run the tests
const runTests = async () => {
    try {
        const token = await loginUser();  // Login and get the access token
        await testTokenOperations(token); // Perform token operations
    } catch (error) {
        console.error('Test execution failed:', error.message);
    }
};

// Run the tests
runTests();
