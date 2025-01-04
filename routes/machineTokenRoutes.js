const express = require('express');
const { getUserConfirmations, handleToken, checkRequestStatus , handleConfirmation} = require('../controllers/machineTokenController');
const { authenticateToken } = require('../middleware/authMiddleware');

const router = express.Router();

// Confirmation routes
router.get('/:userId', authenticateToken,getUserConfirmations );

router.post('/request',authenticateToken,handleToken );

router.get('/request/status/:requestId',authenticateToken,checkRequestStatus);

router.post('/confirm',authenticateToken,handleConfirmation);

module.exports = router;
