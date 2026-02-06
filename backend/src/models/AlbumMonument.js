const mongoose = require('mongoose');

const albumMonumentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    type: String,
    default: ''
  },
  country: {
    type: String,
    default: ''
  },
  region: {
    type: String,
    default: ''
  },
  century: {
    type: String,
    default: ''
  },
  style: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  },
  history: {
    type: String,
    default: ''
  },
  funFacts: [{
    type: String
  }],
  image: {
    type: String,
    default: ''
  },
  folderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Folder',
    default: null
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  visited: {
    type: Boolean,
    default: false
  },
  visitDate: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

albumMonumentSchema.index({ userId: 1 });
albumMonumentSchema.index({ userId: 1, folderId: 1 });

module.exports = mongoose.model('AlbumMonument', albumMonumentSchema);
