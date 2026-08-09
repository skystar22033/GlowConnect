const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { schedulePost, getScheduledPosts } = require('../controllers/scheduleController');

router.post('/schedule', protect, schedulePost);
router.get('/scheduled', protect, getScheduledPosts);

module.exports = router;