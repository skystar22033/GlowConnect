const express = require('express');
const router = express.Router();
const { toggleFollow } = require('../controllers/userController');
const { protect } = require('../middleware/auth');

// Using the toggleFollow from userController
router.post('/:id', protect, toggleFollow);

module.exports = router;