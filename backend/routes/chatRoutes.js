const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getMessages, sendMessage, getConversations } = require('../controllers/chatController');

router.get('/conversations', protect, getConversations);
router.get('/:userId', protect, getMessages);
router.post('/', protect, sendMessage);

module.exports = router;