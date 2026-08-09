const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { addReaction, getReactions } = require('../controllers/reactionController');

router.post('/:id/reaction', protect, addReaction);
router.get('/:id/reactions', getReactions);

module.exports = router;