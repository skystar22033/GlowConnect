const express = require('express');
const router = express.Router();
const {
  addComment,
  deleteComment,
  getComments,
  updateComment
} = require('../controllers/commentController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { commentValidation } = require('../validators/postValidators');

// Get all comments for a post
router.get('/post/:postId', protect, getComments);

// Add comment to a post
router.post('/post/:postId', protect, commentValidation, validate, addComment);

// Update comment
router.put('/:id', protect, validate, updateComment);

// Delete comment
router.delete('/:id', protect, deleteComment);

module.exports = router;