const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authenticateJWT = require('../middleware/authMiddleware');

router.post('/register', userController.createUser);
router.post('/login', userController.loginUser);
router.get('/fetch', authenticateJWT, userController.fetchUser);
router.put('/update', authenticateJWT, userController.updateUser);
router.post('/logout', userController.logoutUser);

module.exports = router;
