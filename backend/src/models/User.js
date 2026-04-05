const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  avatar: {
    type: String,
    default: ''
  },
  // User stats / gamification
  level: {
    type: Number,
    default: 1
  },
  levelTitle: {
    type: String,
    default: 'Iniciante'
  },
  xp: {
    type: Number,
    default: 0
  },
  discoveries: {
    type: Number,
    default: 0
  },
  badges: [{
    name: String,
    description: String,
    icon: String,
    earnedAt: { type: Date, default: Date.now }
  }],
  favoriteMonuments: [{
    name: String,
    location: String,
    addedAt: { type: Date, default: Date.now }
  }],
  visitedMonuments: [{
    name: String,
    location: String,
    visitedAt: { type: Date, default: Date.now }
  }],
  joinedChallenges: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Challenge'
  }],
  notifications: [{
    type: {
      type: String,
      default: 'info'
    },
    message: {
      type: String,
      required: true
    },
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Group',
      default: null
    },
    groupName: {
      type: String,
      default: ''
    },
    reason: {
      type: String,
      default: ''
    },
    kickedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    read: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Password reset
  resetToken: {
    type: String,
    default: null
  },
  resetTokenExpire: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to generate reset token
userSchema.methods.generateResetToken = function() {
  const crypto = require('crypto');
  const resetToken = crypto.randomBytes(32).toString('hex');
  
  this.resetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  this.resetTokenExpire = Date.now() + (30 * 60 * 1000); // 30 minutes
  
  return resetToken;
};

module.exports = mongoose.model('User', userSchema);
