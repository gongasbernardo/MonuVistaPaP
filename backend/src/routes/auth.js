const express = require('express');
const router = express.Router();
const { register, login, getMe, getNotifications, markNotificationsRead } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/me', protect, getMe);
router.get('/notifications', protect, getNotifications);
router.post('/notifications/read', protect, markNotificationsRead);

module.exports = router;
