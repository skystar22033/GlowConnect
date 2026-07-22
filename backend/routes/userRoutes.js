const express = require('express');
const router = express.Router();
const {
  getUserProfile,
  updateUserProfile,
  searchUsers,
  toggleFollow,
  uploadAvatar,
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const upload = require('../middleware/upload');
const { updateProfileValidation } = require('../validators/userValidators');

// NOTE: /search and /me must be registered before /:id so they aren't treated as an id param
router.get('/search', searchUsers);
router.post('/me/avatar', protect, upload.uploadAvatar.single('avatar'), uploadAvatar);
router.get('/:id', getUserProfile);
router.put('/:id', protect, updateProfileValidation, validate, updateUserProfile);
router.post('/:id/follow', protect, toggleFollow);

module.exports = router;
