const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Por favor adicione um título'],
      maxlength: [100, 'Título não pode ter mais de 100 caracteres'],
    },
    description: {
      type: String,
      required: [true, 'Por favor adicione uma descrição'],
      maxlength: [1000, 'Descrição não pode ter mais de 1000 caracteres'],
    },
    location: {
      type: String,
      required: [true, 'Por favor adicione a localização'],
    },
    country: {
      type: String,
      required: [true, 'Por favor selecione um país'],
    },
    region: {
      type: String,
      required: [true, 'Por favor selecione uma região'],
    },
    image: {
      type: String,
      required: [true, 'Por favor envie uma foto'],
    },
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
    userName: {
      type: String,
      required: true,
    },
    likes: [
      {
        userId: mongoose.Schema.ObjectId,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    comments: [
      {
        userId: mongoose.Schema.ObjectId,
        userName: String,
        text: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    ratings: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    views: {
      type: Number,
      default: 0,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Index para pesquisas rápidas
postSchema.index({ country: 1, region: 1 });
postSchema.index({ userId: 1 });
postSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Post', postSchema);
