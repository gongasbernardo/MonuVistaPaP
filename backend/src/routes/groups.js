const express = require('express');
const router = express.Router();
const {
  createGroup,
  getAllGroups,
  getGroupById,
  getUserGroups,
  joinGroup,
  leaveGroup,
  kickMember,
  addMessage,
  shareContent,
  deleteGroup,
  updateGroup
} = require('../controllers/groupController');
const { protect } = require('../middleware/auth');

// Public routes
router.get('/', getAllGroups);

// Protected routes - MUST come before :id route
router.get('/my/groups', protect, getUserGroups);
router.post('/', protect, createGroup);
router.put('/:groupId', protect, updateGroup);
router.delete('/:groupId', protect, deleteGroup);
router.post('/:groupId/join', protect, joinGroup);
router.post('/:groupId/leave', protect, leaveGroup);
router.post('/:groupId/kick', protect, kickMember);
router.post('/:groupId/messages', protect, addMessage);
router.post('/:groupId/share', protect, shareContent);

// Must be last - generic ID route
router.get('/:id', getGroupById);

module.exports = router;
