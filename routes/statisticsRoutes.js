const express = require('express');
const { getTankStats, getEstablishmentStats } = require('../controllers/statisticsController');
const { authenticateToken } = require('../middleware/authMiddleware');

const router = express.Router();

// Statistics routes
router.get('/tank/:tankId', authenticateToken, getTankStats);
router.get('/establishment/:establishmentId', authenticateToken, getEstablishmentStats);

module.exports = router;
