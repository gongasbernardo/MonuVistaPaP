const express = require('express');
const router = express.Router();
const { register, login, getMe, updateProfile, getNotifications, markNotificationsRead, forgotPassword, resetPassword, addFavorite, removeFavorite, markVisited, getUserMonuments } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/me', protect, getMe);
router.put('/me', protect, updateProfile);
router.get('/notifications', protect, getNotifications);
router.post('/notifications/read', protect, markNotificationsRead);
router.post('/favorites', protect, addFavorite);
router.delete('/favorites/:name', protect, removeFavorite);
router.post('/visited', protect, markVisited);
router.get('/monuments', protect, getUserMonuments);

module.exports = router;
