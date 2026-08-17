const express = require('express');
const router = express.Router();
const {
  getUserProfile,
  updateUserProfile,
  searchUsers,
  toggleFollow,
  updateAvatarPreferences,
  getUserStatus,
  uploadAvatar,
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { uploadAvatar: upload } = require('../middleware/upload'); // ✅ CORRECT
const { updateProfileValidation } = require('../validators/userValidators');

// NOTE: /search must be registered before /:id
router.get('/search', searchUsers);
// Add this route
router.get('/:id/status', protect, getUserStatus);

// ✅ Avatar upload - using upload.single('avatar')
router.post('/me/avatar', protect, upload.single('avatar'), uploadAvatar);
// ✅ NEW: Avatar preferences route
router.put('/me/avatar-preferences', protect, updateAvatarPreferences);

router.get('/:id', getUserProfile);
router.put('/:id', protect, updateProfileValidation, validate, updateUserProfile);
router.post('/:id/follow', protect, toggleFollow);

module.exports = router;