const express = require('express');
const router = express.Router();
const {
  getFolders, createFolder, updateFolder, deleteFolder,
  getMonuments, getMonument, addMonument, updateMonument, deleteMonument,
  getStats, checkInAlbum
} = require('../controllers/albumController');
const { protect } = require('../middleware/auth');

// Folders
router.get('/folders', protect, getFolders);
router.post('/folders', protect, createFolder);
router.put('/folders/:id', protect, updateFolder);
router.delete('/folders/:id', protect, deleteFolder);

// Monuments
router.get('/monuments', protect, getMonuments);
router.get('/monuments/:id', protect, getMonument);
router.post('/monuments', protect, addMonument);
router.put('/monuments/:id', protect, updateMonument);
router.delete('/monuments/:id', protect, deleteMonument);

// Stats & Checks
router.get('/stats', protect, getStats);
router.get('/check/:name', protect, checkInAlbum);

module.exports = router;
