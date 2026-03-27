const express = require('express');
const router = express.Router();
const { getChallenges, joinChallenge, updateProgress, seedChallenges, syncProgress } = require('../controllers/challengeController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getChallenges);
router.post('/sync-progress', protect, syncProgress);
router.post('/:id/join', protect, joinChallenge);
router.put('/:id/progress', protect, updateProgress);
router.post('/seed', protect, seedChallenges);

module.exports = router;
