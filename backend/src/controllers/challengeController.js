const Challenge = require('../models/Challenge');
const User = require('../models/User');

// @desc    Get all active challenges
// @route   GET /api/challenges
// @access  Private
exports.getChallenges = async (req, res) => {
  try {
    const challenges = await Challenge.find({ active: true }).sort({ createdAt: -1 });
    const userId = req.user.id;

    // Add user-specific info
    const data = challenges.map(c => {
      const participant = c.participants.find(p => p.userId.toString() === userId);
      return {
        _id: c._id,
        title: c.title,
        description: c.description,
        icon: c.icon,
        target: c.target,
        type: c.type,
        reward: c.reward,
        startsAt: c.startsAt,
        endsAt: c.endsAt,
        participantsCount: c.participants.length,
        joined: !!participant,
        progress: participant ? participant.progress : 0,
        completed: participant ? participant.completed : false,
      };
    });

    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Join a challenge
// @route   POST /api/challenges/:id/join
// @access  Private
exports.joinChallenge = async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id);
    if (!challenge) {
      return res.status(404).json({ success: false, message: 'Desafio não encontrado' });
    }

    const userId = req.user.id;
    const already = challenge.participants.find(p => p.userId.toString() === userId);
    if (already) {
      return res.status(400).json({ success: false, message: 'Já participas neste desafio' });
    }

    challenge.participants.push({ userId, progress: 0 });
    await challenge.save();

    // Add to user's joinedChallenges
    await User.findByIdAndUpdate(userId, { $addToSet: { joinedChallenges: challenge._id } });

    res.status(200).json({ success: true, message: 'Inscrito no desafio!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update challenge progress for a user (called internally)
// @route   PUT /api/challenges/:id/progress
// @access  Private
exports.updateProgress = async (req, res) => {
  try {
    const { progress } = req.body;
    const challenge = await Challenge.findById(req.params.id);
    if (!challenge) {
      return res.status(404).json({ success: false, message: 'Desafio não encontrado' });
    }

    const userId = req.user.id;
    const participant = challenge.participants.find(p => p.userId.toString() === userId);
    if (!participant) {
      return res.status(400).json({ success: false, message: 'Não estás inscrito neste desafio' });
    }

    participant.progress = Math.min(progress, challenge.target);
    if (participant.progress >= challenge.target && !participant.completed) {
      participant.completed = true;
      participant.completedAt = new Date();

      // Award XP and badge
      const user = await User.findById(userId);
      user.xp = (user.xp || 0) + (challenge.reward?.xp || 0);
      if (challenge.reward?.badge?.name) {
        user.badges.push({
          name: challenge.reward.badge.name,
          description: challenge.reward.badge.description || '',
          icon: challenge.reward.badge.icon || 'trophy',
          earnedAt: new Date()
        });
      }
      await user.save();
    }

    await challenge.save();

    res.status(200).json({
      success: true,
      message: participant.completed ? 'Desafio concluído!' : 'Progresso atualizado',
      data: { progress: participant.progress, completed: participant.completed }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Seed default challenges (admin helper)
// @route   POST /api/challenges/seed
// @access  Private
exports.seedChallenges = async (req, res) => {
  try {
    const existing = await Challenge.countDocuments();
    if (existing > 0) {
      return res.status(200).json({ success: true, message: 'Challenges already exist', count: existing });
    }

    const defaults = [
      {
        title: 'Explorador Medieval',
        description: 'Descubra 5 monumentos medievais este mês',
        target: 5,
        type: 'discoveries',
        icon: 'trophy',
        reward: { xp: 200, badge: { name: 'Explorador Medieval', description: 'Descobriu 5 monumentos medievais', icon: 'shield' } }
      },
      {
        title: 'Fotógrafo Cultural',
        description: 'Crie 10 publicações com fotos de monumentos',
        target: 10,
        type: 'posts',
        icon: 'camera',
        reward: { xp: 300, badge: { name: 'Fotógrafo Cultural', description: 'Criou 10 publicações', icon: 'camera' } }
      },
      {
        title: 'Sociável',
        description: 'Junte-se a 3 grupos da comunidade',
        target: 3,
        type: 'groups',
        icon: 'people',
        reward: { xp: 150, badge: { name: 'Sociável', description: 'Juntou-se a 3 grupos', icon: 'people' } }
      },
      {
        title: 'Crítico de Arte',
        description: 'Comente em 15 publicações',
        target: 15,
        type: 'comments',
        icon: 'chatbubble',
        reward: { xp: 250, badge: { name: 'Crítico de Arte', description: 'Comentou em 15 publicações', icon: 'chatbubble' } }
      },
    ];

    await Challenge.insertMany(defaults);

    res.status(201).json({ success: true, message: 'Default challenges seeded', count: defaults.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
