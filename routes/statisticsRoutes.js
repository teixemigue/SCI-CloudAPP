const express = require('express');
const { getTankStats, getEstablishmentStats,getTankTemperatureHistory, getTankBeerServedHistory, getTankLevelHistory } = require('../controllers/statisticsController');
const { authenticateToken } = require('../middleware/authMiddleware');

const router = express.Router();

// Statistics routes
router.get('/tank/:tankId', authenticateToken, getTankStats);
router.get('/establishment/:establishmentId', authenticateToken, getEstablishmentStats);

router.get('/tank/:tankId/temperature/history', authenticateToken, getTankTemperatureHistory);
router.get('/tank/:tankId/beer-served/history', authenticateToken, getTankBeerServedHistory);
router.get('/tank/:tankId/level/history', authenticateToken, getTankLevelHistory);

module.exports = router;
