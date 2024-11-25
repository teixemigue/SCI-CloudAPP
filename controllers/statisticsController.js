const { User } = require('../models/user');
const bcrypt = require('bcryptjs');  // For hashing passwords
const jwt = require('jsonwebtoken');  // For JWT tokens
const config = require('../auth/auth.json');
const refreshKey = config.refreshKey;
const accessKey = config.accessKey;
const { TankTemperatureHistory } = require('../models/tankTemperatureHistory');
const { TankBeerServedHistory } = require('../models/tankBeerServedHistory');
const { TankLevelHistory } = require('../models/tankLevelHistory');
const { Tank } = require('../models/tank');
const { sequelize } = require('../dB/database');
const { Op } = require('sequelize');

const roundToThree = (num) => {
    return num ? Number(Math.round(num + 'e3') + 'e-3') : null;
};

// Get statistics for a specific tank
const getTankStats = async (req, res) => {
    try {
        const { tankId } = req.params;
        const { startDate, endDate } = req.query;

        const dateFilter = {
            datetime: {
                [Op.between]: [
                    startDate || new Date(new Date().setDate(new Date().getDate() - 30)), // default last 30 days
                    endDate || new Date()
                ]
            }
        };

        // Get temperature stats
        const tempStats = await TankTemperatureHistory.findAll({
            where: {
                tankId,
                ...dateFilter
            },
            attributes: [
                [sequelize.fn('AVG', sequelize.col('temperature')), 'avgTemp'],
                [sequelize.fn('MIN', sequelize.col('temperature')), 'minTemp'],
                [sequelize.fn('MAX', sequelize.col('temperature')), 'maxTemp']
            ]
        });

        // Get beer served stats
        const beerStats = await TankBeerServedHistory.findAll({
            where: {
                tankId,
                ...dateFilter
            },
            attributes: [
                [sequelize.fn('SUM', sequelize.col('beerServed')), 'totalBeerServed'],
                [sequelize.fn('AVG', sequelize.col('beerServed')), 'avgBeerServed']
            ]
        });

        // Get level stats
        const levelStats = await TankLevelHistory.findAll({
            where: {
                tankId,
                ...dateFilter
            },
            attributes: [
                [sequelize.fn('AVG', sequelize.col('level')), 'avgLevel'],
                [sequelize.fn('MIN', sequelize.col('level')), 'minLevel'],
                [sequelize.fn('MAX', sequelize.col('level')), 'maxLevel']
            ]
        });

        // Round all the values
        const response = {
            temperature: {
                avgTemp: roundToThree(tempStats[0].dataValues.avgTemp),
                minTemp: roundToThree(tempStats[0].dataValues.minTemp),
                maxTemp: roundToThree(tempStats[0].dataValues.maxTemp)
            },
            beerServed: {
                totalBeerServed: Math.round(beerStats[0].dataValues.totalBeerServed),
                avgBeerServed: roundToThree(beerStats[0].dataValues.avgBeerServed)
            },
            level: {
                avgLevel: roundToThree(levelStats[0].dataValues.avgLevel),
                minLevel: roundToThree(levelStats[0].dataValues.minLevel),
                maxLevel: roundToThree(levelStats[0].dataValues.maxLevel)
            }
        };

        res.json(response);

    } catch (error) {
        console.error('Error getting tank statistics:', error);
        res.status(500).json({ error: 'Failed to get tank statistics' });
    }
};

// Get establishment-wide statistics
const getEstablishmentStats = async (req, res) => {
    try {
        const { establishmentId } = req.params;
        const { startDate, endDate } = req.query;

        // Get all tanks for this establishment
        const tanks = await Tank.findAll({
            where: { establishmentId }
        });

        const tankIds = tanks.map(tank => tank.id);

        const dateFilter = {
            datetime: {
                [Op.between]: [
                    startDate || new Date(new Date().setDate(new Date().getDate() - 30)),
                    endDate || new Date()
                ]
            }
        };

        // Total beer served across all tanks
        const totalBeerServed = await TankBeerServedHistory.sum('beerServed', {
            where: {
                tankId: { [Op.in]: tankIds },
                ...dateFilter
            }
        });

        // Average temperature across all tanks
        const avgTemp = await TankTemperatureHistory.findAll({
            where: {
                tankId: { [Op.in]: tankIds },
                ...dateFilter
            },
            attributes: [
                [sequelize.fn('AVG', sequelize.col('temperature')), 'avgTemp']
            ]
        });

        // Average level across all tanks
        const avgLevel = await TankLevelHistory.findAll({
            where: {
                tankId: { [Op.in]: tankIds },
                ...dateFilter
            },
            attributes: [
                [sequelize.fn('AVG', sequelize.col('level')), 'avgLevel']
            ]
        });

        res.json({
            totalBeerServed: Math.round(totalBeerServed),
            averageTemperature: roundToThree(avgTemp[0].dataValues.avgTemp),
            averageLevel: roundToThree(avgLevel[0].dataValues.avgLevel),
            tankCount: tanks.length
        });

    } catch (error) {
        console.error('Error getting establishment statistics:', error);
        res.status(500).json({ error: 'Failed to get establishment statistics' });
    }
};

module.exports = {
    getTankStats,
    getEstablishmentStats
};
