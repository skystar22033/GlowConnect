const express = require('express');
const router = express.Router();
const {
  createPost,
  createPostBase64, // ✅ ADD THIS
  getPostById,
  updatePost,
  deletePost,
  getFeed,
  getUserPosts,
  toggleLike,
} = require('../controllers/postController');
const { addComment } = require('../controllers/commentController');
const { protect } = require('../middleware/auth');
const { uploadPostMedia } = require('../middleware/upload');
const validate = require('../middleware/validate');
const { postValidation, commentValidation } = require('../validators/postValidators');

router.get('/feed', protect, getFeed);
router.get('/user/:userId', getUserPosts);

// ✅ Base64 route (for videos)
router.post('/base64', protect, createPostBase64);

// ✅ Multer route (for images)
router.post('/', protect, uploadPostMedia, postValidation, validate, createPost);

router.get('/:id', getPostById);
router.put('/:id', protect, uploadPostMedia, updatePost);
router.delete('/:id', protect, deletePost);

router.post('/:id/like', protect, toggleLike);
router.post('/:id/comments', protect, commentValidation, validate, addComment);

module.exports = router;