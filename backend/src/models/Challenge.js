const mongoose = require('mongoose');

const challengeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    default: 'trophy'
  },
  target: {
    type: Number,
    required: true,
    default: 5
  },
  type: {
    type: String,
    enum: ['discoveries', 'posts', 'groups', 'likes', 'comments'],
    default: 'discoveries'
  },
  reward: {
    xp: { type: Number, default: 100 },
    badge: {
      name: String,
      description: String,
      icon: String
    }
  },
  active: {
    type: Boolean,
    default: true
  },
  participants: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    progress: { type: Number, default: 0 },
    completed: { type: Boolean, default: false },
    joinedAt: { type: Date, default: Date.now },
    completedAt: { type: Date, default: null }
  }],
  startsAt: {
    type: Date,
    default: Date.now
  },
  endsAt: {
    type: Date,
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Challenge', challengeSchema);
