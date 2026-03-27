const User = require('../models/User');
const Post = require('../models/Post');
const Group = require('../models/Group');
const AlbumMonument = require('../models/AlbumMonument');
const Challenge = require('../models/Challenge');

// XP thresholds for levels
const LEVEL_THRESHOLDS = [
  { level: 1, xp: 0, title: 'Iniciante' },
  { level: 2, xp: 100, title: 'Curioso' },
  { level: 3, xp: 300, title: 'Explorador' },
  { level: 4, xp: 600, title: 'Aventureiro' },
  { level: 5, xp: 1000, title: 'Descobridor' },
  { level: 6, xp: 1500, title: 'Historiador' },
  { level: 7, xp: 2500, title: 'Mestre Cultural' },
  { level: 8, xp: 4000, title: 'Lenda' },
];

function calculateLevel(xp) {
  let result = LEVEL_THRESHOLDS[0];
  for (const t of LEVEL_THRESHOLDS) {
    if (xp >= t.xp) result = t;
  }
  return result;
}

// @desc    Get user stats
// @route   GET /api/stats
// @access  Private
exports.getUserStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select('level levelTitle xp discoveries badges joinedChallenges');

    // Count real data
    const postsCount = await Post.countDocuments({ userId });
    const groupsCount = await Group.countDocuments({ members: userId });
    const monumentsCount = await AlbumMonument.countDocuments({ userId, visited: true });

    // Recalculate discoveries (visited monuments)
    const totalDiscoveries = monumentsCount;

    // Recalculate XP: 50 per post, 30 per discovery, 20 per group joined
    let calculatedXp = (postsCount * 50) + (totalDiscoveries * 30) + (groupsCount * 20);

    // Add XP from completed challenges
    const completedChallenges = await Challenge.find({
      active: true,
      'participants': {
        $elemMatch: { userId, completed: true }
      }
    });
    for (const ch of completedChallenges) {
      calculatedXp += ch.reward?.xp || 0;
    }

    // Update user if needed
    const levelInfo = calculateLevel(calculatedXp);
    if (user.xp !== calculatedXp || user.level !== levelInfo.level) {
      user.xp = calculatedXp;
      user.level = levelInfo.level;
      user.levelTitle = levelInfo.title;
      user.discoveries = totalDiscoveries;
      await user.save();
    }

    res.status(200).json({
      success: true,
      data: {
        level: levelInfo.level,
        levelTitle: levelInfo.title,
        xp: calculatedXp,
        nextLevelXp: LEVEL_THRESHOLDS.find(t => t.xp > calculatedXp)?.xp || null,
        discoveries: totalDiscoveries,
        badges: user.badges || [],
        badgesCount: (user.badges || []).length,
        postsCount,
        groupsCount
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user stats',
      error: error.message
    });
  }
};
