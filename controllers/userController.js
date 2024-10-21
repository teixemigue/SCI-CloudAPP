
const {User,Token,Establishment,Tank} = require('../models/relations')
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
  const { username, email, password, role,key } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    if(role != 'admin' && role!='user')
    {
        res.status(404).json({error: 'not found'})
        return;
    }

    if(role == 'admin')
    {
        if(key != config.adminRegistration)
        {
            res.status(403).json({ error: 'forbidden access' });
            return;
        } 
    }
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

const createNewEstablishment = async (req, res) => {

    try {
        const { name, location } = req.body;
        const userId = req.user.userId;

        if (!name || !location) {
            return res.status(400).json({ error: "Name and location are required" });
        }

        // Insert new establishment into the database using Sequelize
        const newEstablishment = await Establishment.create({
            name:name,
            address:location,
            OwnerId:userId
        });

        return res.status(201).json({
            message: "Establishment added successfully",
            establishmentId: newEstablishment.id,  // ID of the new establishment
            name: newEstablishment.name,
            location: newEstablishment.location
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal server error" });
    }
    
}

const createNewTankForEstablishment = async (req, res) => {

    try {
        const { establishmentId } = req.params;
        const userId = req.user.userId;

        if (!establishmentId || !userId) {
            return res.status(400).json({ error: "User and Establishment are required" });
        }

        const establishment = await Establishment.findOne({
            where: {
                id: establishmentId,
                OwnerId: ownerId // Check that the user is the owner
            },
            attributes: ['id', 'name', 'address', 'OwnerId'] 
            });
      
          if (!establishment) {
            return res.status(403).json({ error: "Forbidden: You are not the owner of this establishment." });
          }

        // Insert new establishment into the database using Sequelize
        const newEstablishment = await Tank.create({
            level:0,
            beersServed:0,
            beerPressure:1,
            temp:0,
            EstablishmentId:establishmentId
        });

        return res.status(201).json({
            message: "Tank added successfully to "+establishment.name,
            establishmentId: newEstablishment.id,  // ID of the new establishment
            name: newEstablishment.name,
            location: newEstablishment.location
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal server error" });
    }
    
}

const createNewTokenUserEstablishment = async (req, res) => {

    try {
        const { establishmentId } = req.params;
        const {numberTokens,clientId} = req.body;
        const userId = req.user.userId;

        if (!establishmentId || !userId) {
            return res.status(400).json({ error: "User and Establishment are required" });
        }

        const establishment = await Establishment.findOne({
            where: {
                id: establishmentId,
                OwnerId: ownerId // Check that the user is the owner
            },
            attributes: ['id', 'name', 'address', 'OwnerId'] 
            });
      
          if (!establishment) {
            return res.status(403).json({ error: "Forbidden: You are not the owner of this establishment." });
          }

        
        // Insert new establishment into the database using Sequelize
        const newToken = await Token.create({
            quantity:numberTokens,
            status:'active',
            UserId:clientId,
            EstablishmentId:establishmentId
        });

        return res.status(201).json({
            message: "Tokens given to client"
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal server error" });
    }
    
}

const addTokenQuantity = async (req, res) => {
    try {
        const { tokenId } = req.params; // Token ID from the request parameters
        const { additionalQuantity } = req.body; // Additional quantity to add
        // Validate input
        if (!tokenId || !additionalQuantity || additionalQuantity <= 0) {
            return res.status(400).json({ error: "Valid  ID and quantity are required." });
        }

        // Find the token by ID
        const token = await Token.findOne({ where: { id: tokenId } });

        if (!token) {
            return res.status(404).json({ error: "Token not found." });
        }

        // Update the quantity
        token.quantity += additionalQuantity; // Add the additional quantity
        await token.save(); // Save the updated token

        return res.status(200).json({
            message: "Token quantity updated successfully.",
            updatedQuantity: token.quantity // Return the updated quantity
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

const subtractTokenQuantity = async (req, res) => {
    try {
        const { tokenId } = req.params; // Token ID from the request parameters
        const { quantityToSubtract } = req.body; // Quantity to subtract
        
        // Validate input
        if (!tokenId || !quantityToSubtract || quantityToSubtract <= 0) {
            return res.status(400).json({ error: "Valid token ID and quantity are required." });
        }

        // Find the token by ID
        const token = await Token.findOne({ where: { id: tokenId } });

        if (!token) {
            return res.status(404).json({ error: "Token not found." });
        }

        // Check if enough quantity is available
        if (token.quantity < quantityToSubtract) {
            return res.status(400).json({ error: "Insufficient token quantity." });
        }

        // Update the quantity
        token.quantity -= quantityToSubtract; // Subtract the quantity
        await token.save(); // Save the updated token

        return res.status(200).json({
            message: "Token quantity updated successfully.",
            updatedQuantity: token.quantity // Return the updated quantity
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal server error" });
    }
};


const updateTank = async (req, res) => {
    const { tankId } = req.params; // Get the tank ID from the URL
    const { establishmentId, newData } = req.body; // New data to update the tank
    const userId = req.user.userId; // Get the user ID from the authenticated token

    try {
        // Find the establishment and verify ownership
        const establishment = await Establishment.findOne({
            where: {
                id: establishmentId,
                OwnerId: userId // Ensure the user is the owner of the establishment
            }
        });

        if (!establishment) {
            return res.status(403).json({ error: "Forbidden: You are not the owner of this establishment." });
        }

        // Find the tank by its ID
        const tank = await Tank.findOne({
            where: {
                id: tankId,
                EstablishmentId: establishmentId // Ensure the tank belongs to the correct establishment
            }
        });

        if (!tank) {
            return res.status(404).json({ error: "Tank not found." });
        }

        // Update the tank with the new data
        await tank.update(newData); // Update the tank with the new data provided in the request body

        return res.status(200).json({ message: "Tank updated successfully.", tank });
    } catch (error) {
        console.error('Error updating tank:', error);
        return res.status(500).json({ error: "Internal server error." });
    }
};


const updateTokenStatus = async (req, res) => {
    const { tokenId } = req.params; // Get the token ID from the URL
    const { establishmentId, newStatus } = req.body; // New status to update the token
    const userId = req.user.userId; // Get the user ID from the authenticated token

    try {
        // Find the establishment and verify ownership
        const establishment = await Establishment.findOne({
            where: {
                id: establishmentId,
                OwnerId: userId // Ensure the user is the owner of the establishment
            }
        });

        if (!establishment) {
            return res.status(403).json({ error: "Forbidden: You are not the owner of this establishment." });
        }

        // Find the token by its ID
        const token = await Token.findOne({
            where: {
                id: tokenId,
                EstablishmentId: establishmentId // Ensure the token belongs to the correct establishment
            }
        });

        if (!token) {
            return res.status(404).json({ error: "Token not found." });
        }

        // Update the token status
        await token.update({ status: newStatus }); // Update the token with the new status provided in the request body

        return res.status(200).json({ message: "Token status updated successfully.", token });
    } catch (error) {
        console.error('Error updating token status:', error);
        return res.status(500).json({ error: "Internal server error." });
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


const getTanksForEstablishment = async (req, res) => {

    const { establishmentId} = req.params;
    const ownerId = req.user.userId;

    if(!establishmentId)
    {
        return res.status(400).json({message:'Establishment ID required'});
    }

    try {


         // Check if the user is the owner of the establishment
        const establishment = await Establishment.findOne({
        where: {
            id: establishmentId,
            OwnerId: ownerId // Check that the user is the owner
        },
        attributes: ['id', 'name', 'address', 'OwnerId'] 
        });
  
      if (!establishment) {
        return res.status(403).json({ error: "Forbidden: You are not the owner of this establishment." });
      }



        const tanks = await Tank.findAll({
            where: {
                EstablishmentId: establishmentId
            }
        });

        res.json(tanks);
    } catch (error) {
        console.error('Error fetching tanks:', error);
        res.status(500).json({ message: 'Error fetching tanks', error });
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
        }
      });
  
      res.json(tokens);
    } catch (error) {
      console.error('Error fetching tokens:', error);
      res.status(500).json({ message: 'Error fetching tokens', error });
    }
  };





const getAllEstablhisments = async (req, res) => {
    
   
    try {
      const establishments = await Establishment.findAll();
  
      res.json(establishments);
    } catch (error) {
      console.error('Error fetching establishments:', error);
      res.status(500).json({ message: 'Error fetching estabishments', error });
    }
}
  
module.exports = { getUsers, createUser, loginUser ,getUserTokensForEstablishment, getTanksForEstablishment, createNewEstablishment,getAllEstablhisments,createNewTankForEstablishment,createNewTokenUserEstablishment,addTokenQuantity,subtractTokenQuantity,updateTank,updateTokenStatus};
