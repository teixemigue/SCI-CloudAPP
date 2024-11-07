const express = require('express');
const { getUsers, createUser, loginUser, getUserTokensForEstablishment, getTanksForEstablishment, createNewEstablishment, getAllEstablhisments, createNewTankForEstablishment, createNewTokenUserEstablishment, addTokenQuantity, subtractTokenQuantity, updateTank, updateTokenStatus, consumeToken, verifyToken, getUserInfo, getStaffForEstablishment } = require('../controllers/userController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes
router.post('/register', createUser);
router.post('/login', loginUser);




// Protected routes (token required)
router.get('/user/establishment/:establishmentId', authenticateToken, getUserTokensForEstablishment);
router.get('/user/establishment/:establishmentId/tanks', authenticateToken, getTanksForEstablishment);
router.post('/user/establishment/create',authenticateToken,createNewEstablishment);
router.post('/user/establishment/addTank',authenticateToken,createNewTankForEstablishment);


router.post('/user/establishment/:establishmentId/tokens/create',authenticateToken,createNewTokenUserEstablishment);
router.post('/user/token/update/:tokenId', authenticateToken, updateTokenStatus);
router.post('/user/token/consume/:tokenId', authenticateToken, consumeToken);
router.post('/verify/token/:tokenId',authenticateToken,verifyToken);

router.post('/tank/update/:tankId', authenticateToken, updateTank);


router.get('/user/myinfo',authenticateToken,getUserInfo);
router.get('/staff/:establishmentId',authenticateToken,getStaffForEstablishment);

//Admin only routes
router.get('/info/users', authenticateToken, authorizeRoles('admin'), getUsers);
router.get('/info/establishments',authenticateToken,getAllEstablhisments);





module.exports = router;
