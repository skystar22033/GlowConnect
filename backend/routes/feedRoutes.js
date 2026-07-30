const express = require('express');
const router = express.Router();
const { getFeed } = require('../controllers/postController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getFeed);

module.exports = router;