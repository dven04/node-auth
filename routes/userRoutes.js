const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authenticateJWT = require('../middleware/authMiddleware');

router.post('/register', userController.createUser);
router.get('/fetch', authenticateJWT, userController.fetchUser);
router.post('/login', userController.loginUser);
router.post('/logout', userController.logoutUser);
router.put('/update', authenticateJWT, userController.updateUser);

module.exports = router;
