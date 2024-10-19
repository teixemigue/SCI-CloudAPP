const express = require('express');
const { getUsers, createUser, loginUser } = require('../controllers/userController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes
router.post('/register', createUser);
router.post('/login', loginUser);

// Protected routes (token required)
router.get('/info/users', authenticateToken, authorizeRoles('admin'), getUsers);


module.exports = router;
