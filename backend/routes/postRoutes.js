const express = require('express');
const router = express.Router();
const {
  createPost,
  getPostById,
  updatePost,
  deletePost,
  getFeed,
  getUserPosts,
  toggleLike,
} = require('../controllers/postController');
const { addComment } = require('../controllers/commentController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');
const validate = require('../middleware/validate');
const { postValidation, commentValidation } = require('../validators/postValidators');

// NOTE: specific routes (/feed, /user/:userId) must be declared before the generic /:id route

router.get('/feed', protect, getFeed);
router.get('/user/:userId', getUserPosts);

router.post('/', protect, upload.single('image'), postValidation, validate, createPost);
router.get('/:id', getPostById);
router.put('/:id', protect, upload.single('image'), updatePost);
router.delete('/:id', protect, deletePost);

router.post('/:id/like', protect, toggleLike);
router.post('/:id/comments', protect, commentValidation, validate, addComment);

module.exports = router;
