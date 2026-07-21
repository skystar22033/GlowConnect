const express = require('express');
const router = express.Router();
const { getUserProfile, updateUserProfile, searchUsers } = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { updateProfileValidation } = require('../validators/userValidators');

// NOTE: /search must be registered before /:id so "search" isn't treated as an id param
router.get('/search', searchUsers);
router.get('/:id', getUserProfile);
router.put('/:id', protect, updateProfileValidation, validate, updateUserProfile);

module.exports = router;
