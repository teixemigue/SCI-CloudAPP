const { User } = require('../models/user');
const bcrypt = require('bcryptjs');  // For hashing passwords
const jwt = require('jsonwebtoken');  // For JWT tokens
const config = require('../auth/auth.json');
const refreshKey = config.refreshKey;
const accessKey = config.accessKey;



// Get all users
const refreshToken = async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken)
    {
        console.log("Request for refresh token does not have a refresh token");
        return res.status(401).json({ message: 'Refresh token missing' });
    } 
  
    jwt.verify(refreshToken, refreshKey, (err, user) => {
      if (err) {
        console.log("Invalid refresh token");
        return res.status(403).json({ message: 'Invalid refresh token' });

      }
        
  
      const newAccessToken = jwt.sign({ userId: user.userId, role: user.role }, accessKey, { expiresIn: '15m' });
      const newRefreshToken = jwt.sign({ userId: user.userId, role: user.role }, refreshKey, { expiresIn: '30m' });


  
      res.status(200).json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
    });
};


module.exports = { refreshToken};
