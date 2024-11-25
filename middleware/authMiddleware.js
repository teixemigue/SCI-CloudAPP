const jwt = require('jsonwebtoken');
const config = require('../auth/auth.json');
const secretKey = config.accessKey;
const specialUserKey = config.specialUser;

exports.authenticateToken = async (req, res, next) => {
  try {
    // First check if it's the special user
    const specialUser = req.headers['special-key']; 
    if (specialUser === specialUserKey) { 
      req.user = {
        id: 'special',
        role: 'special'
      };
      return next();
    }

    // Regular authentication logic
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    // Rest of your existing auth logic...
    jwt.verify(token, secretKey, (err, user) => {
      if (err) return res.status(403).json({ message: 'Invalid token' });
      req.user = user;
      next();
    });
  } catch (error) {
    res.status(500).json({ message: 'Authentication error' });
  }
};


exports.authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    next();
  };
};
 