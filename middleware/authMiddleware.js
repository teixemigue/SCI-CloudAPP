const jwt = require('jsonwebtoken');
const config = require('../auth/auth.json');
const secretKey = config.accessKey;


exports.authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  

  if (!token) return res.status(401).json({ message: 'Token missing' });


  jwt.verify(token, secretKey, (err, user) => {
    if (err) {
      console.log("Token verification error:", err);  
      return res.status(403).json({ message: 'Invalid token' });
    }
    req.user = user;  
    next();
  });

};

exports.authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    next();
  };
};
 