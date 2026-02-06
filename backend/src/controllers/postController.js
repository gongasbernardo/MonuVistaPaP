const Post = require('../models/Post');
const fs = require('fs');
const path = require('path');

// @desc    Criar uma nova publicação
// @route   POST /api/posts
// @access  Private
exports.createPost = async (req, res) => {
  try {
    const { title, description, location, country, region, image } = req.body;
    const userId = req.user.id;

    if (!title || !description || !location || !country || !region || !image) {
      return res
        .status(400)
        .json({ success: false, message: 'Por favor preencha todos os campos' });
    }

    const post = await Post.create({
      title,
      description,
      location,
      country,
      region,
      image,
      userId,
      userName: req.user.name,
    });

    res.status(201).json({
      success: true,
      message: 'Publicação criada com sucesso',
      data: post,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Obter todas as publicações
// @route   GET /api/posts
// @access  Public
exports.getPosts = async (req, res) => {
  try {
    const { page = 1, limit = 10, country, region } = req.query;
    let filter = {};

    if (country) filter.country = country;
    if (region) filter.region = region;

    const posts = await Post.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('userId', 'name email')
      .exec();

    const total = await Post.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: posts,
      totalPosts: total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Obter publicações por país
// @route   GET /api/posts/country/:country
// @access  Public
exports.getPostsByCountry = async (req, res) => {
  try {
    const { country } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const posts = await Post.find({ country })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('userId', 'name email')
      .exec();

    const total = await Post.countDocuments({ country });

    res.status(200).json({
      success: true,
      data: posts,
      totalPosts: total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Obter publicações por região
// @route   GET /api/posts/region/:region
// @access  Public
exports.getPostsByRegion = async (req, res) => {
  try {
    const { region } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const posts = await Post.find({ region })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('userId', 'name email')
      .exec();

    const total = await Post.countDocuments({ region });

    res.status(200).json({
      success: true,
      data: posts,
      totalPosts: total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Adicionar comentário a uma publicação
// @route   PUT /api/posts/:id/comment
// @access  Private
exports.addComment = async (req, res) => {
  try {
    const { text } = req.body;
    const postId = req.params.id;

    if (!text) {
      return res
        .status(400)
        .json({ success: false, message: 'Por favor adicione um comentário' });
    }

    const post = await Post.findByIdAndUpdate(
      postId,
      {
        $push: {
          comments: {
            userId: req.user.id,
            userName: req.user.name,
            text,
            createdAt: new Date(),
          },
        },
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Comentário adicionado',
      data: post,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Like/Unlike a publicação
// @route   PUT /api/posts/:id/like
// @access  Private
exports.likePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user.id;

    let post = await Post.findById(postId);

    // Verificar se já deu like
    const likeIndex = post.likes.findIndex(
      (like) => like.userId.toString() === userId
    );

    if (likeIndex > -1) {
      // Remove like (unlike)
      post.likes.splice(likeIndex, 1);
    } else {
      // Adiciona like
      post.likes.push({ userId });
    }

    post = await post.save();

    res.status(200).json({
      success: true,
      message: likeIndex > -1 ? 'Like removido' : 'Like adicionado',
      data: post,
      likes: post.likes.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Obter um post específico
// @route   GET /api/posts/:id
// @access  Public
exports.getPost = async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    ).populate('userId', 'name email');

    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: 'Publicação não encontrada' });
    }

    res.status(200).json({
      success: true,
      data: post,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Eliminar publicação
// @route   DELETE /api/posts/:id
// @access  Private
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: 'Publicação não encontrada' });
    }

    // Verificar se o utilizador é o dono
    if (post.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Não tem permissão para eliminar esta publicação',
      });
    }

    await Post.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Publicação eliminada',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
