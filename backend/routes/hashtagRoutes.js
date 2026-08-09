const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getTrendingHashtags, getPostsByHashtag } = require('../controllers/hashtagController');

router.get('/trending', getTrendingHashtags);
router.get('/:name/posts', getPostsByHashtag);

module.exports = router;