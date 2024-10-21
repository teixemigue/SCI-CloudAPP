const express = require('express');
const { getUsers, createUser, loginUser, getUserTokensForEstablishment, getTanksForEstablishment, createNewEstablishment, getAllEstablhisments, createNewTankForEstablishment, createNewTokenUserEstablishment, addTokenQuantity, subtractTokenQuantity, updateTank, updateTokenStatus } = require('../controllers/userController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes
router.post('/register', createUser);
router.post('/login', loginUser);

// Protected routes (token required)
router.get('/user/establishment/:establishmentId', authenticateToken, getUserTokensForEstablishment);
router.get('/user/establishment/:establishmentId/tanks', authenticateToken, getTanksForEstablishment);
router.post('/user/establishment/create',authenticateToken,createNewEstablishment);
router.post('/user/establishment/add/tank',authenticateToken,createNewTankForEstablishment);
router.post('/user/establishment/:establishmentId/tokens/create',authenticateToken,createNewTokenUserEstablishment);
router.post('/user/token/add/:tokenId', authenticateToken, addTokenQuantity);
router.post('/user/token/subtract/:tokenId', authenticateToken, subtractTokenQuantity);
router.post('/tank/update/:tankId', authenticateToken, updateTank); // Update tank route
router.put('/user/token/update/:tokenId', authenticateToken, updateTokenStatus); // Update token status route



//Admin routes
router.get('/info/users', authenticateToken, authorizeRoles('admin'), getUsers);
router.get('/info/establishments',authenticateToken,authorizeRoles('admin'),getAllEstablhisments);



module.exports = router;
