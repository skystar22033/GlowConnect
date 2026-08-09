const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { savePost, getSavedPosts } = require('../controllers/savedController');

router.post('/:id/save', protect, savePost);
router.get('/saved', protect, getSavedPosts);

module.exports = router;