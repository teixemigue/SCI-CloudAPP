const jwt = require('jsonwebtoken');
const config = require('../auth/auth.json');
const secretKey = config.accessKey;


exports.authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ message: 'Token missing' });

    jwt.verify(token, secretKey, (err, user) => {
        if (err) return res.status(403).json({ message: 'Invalid token' });

        // Token is valid, attach user info to the request object
        console.log("Valid token, attaching user");
        console.log("user:",user);
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
 