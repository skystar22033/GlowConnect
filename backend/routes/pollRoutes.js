const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { createPoll, votePoll, getPollResults } = require('../controllers/pollController');

router.post('/create', protect, createPoll);
router.post('/:id/vote', protect, votePoll);
router.get('/:id/results', getPollResults);

module.exports = router;