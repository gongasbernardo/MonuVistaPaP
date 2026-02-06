const express = require('express');
const router = express.Router();
const {
  createPost,
  getPosts,
  getPostsByCountry,
  getPostsByRegion,
  addComment,
  likePost,
  getPost,
  deletePost,
} = require('../controllers/postController');
const { protect } = require('../middleware/auth');

// Posts públicos
router.get('/', getPosts);
router.get('/:id', getPost);
router.get('/country/:country', getPostsByCountry);
router.get('/region/:region', getPostsByRegion);

// Posts protegidos (requerem autenticação)
router.post('/', protect, createPost);
router.put('/:id/like', protect, likePost);
router.put('/:id/comment', protect, addComment);
router.delete('/:id', protect, deletePost);

module.exports = router;
