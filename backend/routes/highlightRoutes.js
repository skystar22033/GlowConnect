const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { createHighlight, getUserHighlights } = require('../controllers/highlightController');

router.post('/create', protect, createHighlight);
router.get('/user/:userId', getUserHighlights);

module.exports = router;