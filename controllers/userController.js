
const {User,Token,Establishment,Tank,EstablishmentStaff, TankBeerServedHistory, TankLevelHistory, TankTemperatureHistory} = require('../models/relations')
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
          attributes: ['id', 'EstablishmentId', 'createdAt', 'updatedAt']
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
          userId: token.userId,
          establishmentId: token.EstablishmentId,
          createdAt: token.createdAt,
          updatedAt: token.updatedAt
        }))
      }));
  
      console.log('User Info:');
      formattedUsers.forEach(user => {
        console.log('User: ${user.username}, Tokens:');
        user.tokens.forEach(token => {
          console.log('  - Token ID: ${token.id}, Quantity: ${token.quantity}, Establishment ID: ${token.establishmentId}, Created At: ${token.createdAt}');
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
        res.status(404).json({error: 'Role not recognized'})
        return;
    }

    if(role == 'admin')
    {
        if(key != config.adminRegistration)
        {
            res.status(403).json({ error: 'You dont have the requirements to create a cloud admin account' });
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
      const { name, location, price} = req.body;
      const userId = req.user.userId;

      if (!name || !location || !price) {
          return res.status(400).json({ error: "Name, location and price are required" });
      }

      // Create a new establishment
      const newEstablishment = await Establishment.create({
          name: name,
          address: location,
          price: price  
      });

      // Add the user as part of the establishment's staff
      await EstablishmentStaff.create({
          userId: userId,
          establishmentId: newEstablishment.id,
          role:'owner'
      });

      return res.status(201).json({
          message: "Establishment added successfully",
          establishmentId: newEstablishment.id, 
          name: newEstablishment.name,
          location: newEstablishment.address
      });
  } catch (error) {
      console.error("Error creating establishment:", error);
      return res.status(500).json({ error: "Internal server error" });
  }
};




const createNewTankForEstablishment = async (req, res) => {
  try {
      const { establishmentName } = req.body;
      const userId = req.user.userId;

      if (!establishmentName || !userId) {
          return res.status(400).json({ error: "User and Establishment are required" });
      }

      const establishment = await Establishment.findOne({
          where: {name: establishmentName}
      });

      if(!establishment)
      {
        return res.status(404).json({ error: "Establishment not found" });
      }
      // Check if the user is associated with the establishment as part of the staff
      const staffAssociation = await EstablishmentStaff.findOne({
          where: { userId, establishmentId: establishment.id }
      });

      if (!staffAssociation) {
          return res.status(403).json({ error: "Forbidden: You are not authorized to add a tank to this establishment." });
      }

      if(staffAssociation.role != 'owner' && req.user.role != 'admin')
      {
        return res.status(403).json({ error: "Forbidden: You are not authorized to add a tank to this establishment, you are not the owner." });
      }
      
      const newTank = await Tank.create({
          level: 0,
          beersServed: 0,
          temp: 0,
          EstablishmentId: establishment.id
      });

      return res.status(201).json({
          message: `Tank added successfully to establishment ${establishment.name}`,
          tankId: newTank.id,
          level: newTank.level,
          beersServed: newTank.beersServed,
          temp: newTank.temp
      });
  } catch (error) {
      console.error("Error adding new tank:", error);
      return res.status(500).json({ error: "Internal server error" });
  }
};

const addStaffEstablishment = async (req, res) =>{
    
  const { establishmentId } = req.params;
  const { clientId } = req.body;
  const userId = req.user.userId;

  if (!establishmentId || !clientId) {
      return res.status(400).json({ error: "Client and Establishment are required" });
  }


  
  try {
    const staffAssociation = await EstablishmentStaff.findOne({
        where: { userId, establishmentId }
    });

    if ((!staffAssociation || staffAssociation.role != 'owner' ) && req.user.role != 'admin') {
        return res.status(403).json({ error: "Forbidden: You are not authorized" });
    }

    await EstablishmentStaff.create({
      userId: clientId,
      establishmentId: establishmentId,
      role:'staff'
  });
    
  } catch (error) {
      console.error("Error adding staff:", error);
      return res.status(500).json({ error: "Error adding staff" });
  }

      
   
};


const createNewTokenUserEstablishment = async (req, res) => {
  try {
      const { establishmentId } = req.params;
      const { numberTokens, clientId } = req.body;
      const userId = req.user.userId;

      if (!establishmentId || !userId) {
          return res.status(400).json({ error: "User and Establishment are required" });
      }

      if (!numberTokens || numberTokens <= 0) {
          return res.status(400).json({ error: "Number of tokens must be greater than zero" });
      }

      
      const createdTokens = [];

      try {
          for (let i = 0; i < numberTokens; i++) {
              const token = await Token.create({
                  status: 'phone',
                  UserId: clientId,
                  EstablishmentId: establishmentId
              });
              createdTokens.push(token);
          }
          console.log(`${numberTokens} tokens created successfully`);
      } catch (error) {
          console.error("Error creating tokens:", error);
          return res.status(500).json({ error: "Error creating tokens" });
      }

      return res.status(201).json({
          message: `${numberTokens} tokens created successfully for the client`,
          tokens: createdTokens  
      });
  } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal server error" });
  }
};


const consumeToken = async (req, res) => {
  try {
      const { tokenId } = req.params;
      const userId = req.user.userId;

      if (!tokenId) {
          return res.status(400).json({ error: "Token ID is required" });
      }

      const token = await Token.findOne({
          where: {
              id: tokenId,
              UserId: userId 
          }
      });

      if (!token) {
          return res.status(404).json({ error: "Token not found or you are not authorized to consume it" });
      }

      
      await token.destroy();

      return res.status(200).json({ message: "Token consumed successfully" });
  } catch (error) {
      console.error("Error consuming token:", error);
      return res.status(500).json({ error: "Internal server error" });
  }
};


const verifyToken = async (req, res) => {
  try {
      const { tokenId } = req.params;

      if (!tokenId) {
          return res.status(400).json({ error: "Token ID is required" });
      }

      
      const token = await Token.findOne({
          where: { id: tokenId }
      });

      if (token) {
          return res.status(200).json({ valid: true, message: "Token valid" });
      } else {
          return res.status(404).json({ valid: false, message: "Token invalid" });
      }
  } catch (error) {
      console.error("Error checking token existence:", error);
      return res.status(500).json({ error: "Internal server error" });
  }
};




const updateTank = async (req, res) => {
    const { tankId } = req.params; 
    const { establishmentId, level,beersServed,temp } = req.body; 
    const userId = req.user.userId; 

    try {
        
      const staffAssociation = await EstablishmentStaff.findOne({
          where: { userId, establishmentId }
      });

      if (!staffAssociation && req.user.role != 'admin') {
          return res.status(403).json({ error: "Forbidden: You are not authorized to alter tank from this establishment." });
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


        const updatedFields = {};
        if (level !== undefined && level != tank.level) {

          updatedFields.level = level;
          await TankLevelHistory.create({
            tankId:tank.id,
            datetime: new Date(),
            level:level,
          });
        }
          
          
        if (beersServed !== undefined && beersServed > 0){
          updatedFields.beersServed = beersServed + tank.beersServed;
          await TankBeerServedHistory.create({
            tankId:tank.id,
            datetime: new Date(),
            beerServed:beersServed,
          });
        } 

        if (temp !== undefined && temp != tank.temp){
          updatedFields.temp = temp;
          await TankTemperatureHistory.create({
            tankId:tank.id,
            datetime: new Date(),
            temperature: temp,
          });
        } 

        

        await tank.update(updatedFields);



        return res.status(200).json({ message: "Tank updated successfully.", tank });
    } catch (error) {
        console.error('Error updating tank:', error);
        return res.status(500).json({ error: "Internal server error." });
    }
};

//todo
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

        if (!establishment && req.user.role != 'admin') {
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

//todo
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
  
module.exports = { getUsers, createUser, loginUser ,getUserTokensForEstablishment, getTanksForEstablishment, createNewEstablishment,getAllEstablhisments,createNewTankForEstablishment,createNewTokenUserEstablishment,updateTank,updateTokenStatus,consumeToken,verifyToken,addStaffEstablishment};
