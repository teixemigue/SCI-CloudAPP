const express = require('express');
const {refreshToken} = require('../controllers/tokenController');

const router = express.Router();

// Public routes
router.post('/refresh', refreshToken);


module.exports = router;
