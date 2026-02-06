const express = require('express');
const router = express.Router();
const { getChallenges, joinChallenge, updateProgress, seedChallenges } = require('../controllers/challengeController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getChallenges);
router.post('/:id/join', protect, joinChallenge);
router.put('/:id/progress', protect, updateProgress);
router.post('/seed', protect, seedChallenges);

module.exports = router;
