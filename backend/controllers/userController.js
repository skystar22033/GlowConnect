const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const User = require('../models/User');
const cloudinary = require('../config/cloudinary');
const ApiError = require('../utils/ApiError');
const { success } = require('../utils/apiResponse');

// @route   GET /api/users/:id
// @access  Public
// @route   GET /api/users/:id
// @access  Public
const getUserProfile = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, 'Invalid user id');
  }

  const user = await User.findById(id)
    .populate('followers', 'username fullName profileImage avatarPreferences')
    .populate('following', 'username fullName profileImage avatarPreferences');

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  return success(res, 200, 'User profile fetched', {
    user: {
      _id: user._id,
      username: user.username,
      fullName: user.fullName,
      bio: user.bio,
      profileImage: user.profileImage,
      avatarPreferences: user.avatarPreferences || { selectedAvatar: 'avatar1' },
      followers: user.followers,
      following: user.following,
      followersCount: user.followers.length,
      followingCount: user.following.length,
      createdAt: user.createdAt,
    },
  });
});
// @route   PUT /api/users/:id
// @access  Private

// @route   GET /api/users/:id/status
// @access  Private
const getUserStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const onlineUsers = req.app.get('onlineUsers') || new Map();
  const isOnline = onlineUsers.has(id);
  
  return success(res, 200, 'User status fetched', { isOnline });
});



const updateUserProfile = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, 'Invalid user id');
  }

  if (id !== req.user._id.toString()) {
    throw new ApiError(403, 'You can only update your own profile');
  }

  const allowedFields = ['fullName', 'bio', 'profileImage'];
  const updates = {};
  for (const field of allowedFields) {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  }

  const user = await User.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true,
  }).select('-password');

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  return success(res, 200, 'Profile updated successfully', {
    user: {
      _id: user._id,
      username: user.username,
      fullName: user.fullName,
      bio: user.bio,
      profileImage: user.profileImage,
      avatarPreferences: user.avatarPreferences || null,
    },
  });
});

// ✅ NEW: Update avatar preferences
const updateAvatarPreferences = asyncHandler(async (req, res) => {
  const { avatarPreferences } = req.body;

  if (!avatarPreferences || !avatarPreferences.selectedAvatar) {
    throw new ApiError(400, 'Avatar selection is required');
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { avatarPreferences },
    { new: true, runValidators: true }
  ).select('-password');

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  return success(res, 200, 'Avatar updated successfully', {
    user: {
      _id: user._id,
      username: user.username,
      fullName: user.fullName,
      profileImage: user.profileImage,
      avatarPreferences: user.avatarPreferences,
    },
  });
});

// @route   GET /api/users/search?q=
// @access  Public
const searchUsers = asyncHandler(async (req, res) => {
  const { q } = req.query;

  if (!q || !q.trim()) {
    return success(res, 200, 'Search results', { users: [] });
  }

  const regex = new RegExp(q.trim(), 'i');

  const users = await User.find({
    $or: [{ username: regex }, { fullName: regex }],
  })
    .select('username fullName profileImage bio avatarPreferences')
    .limit(20);

  return success(res, 200, 'Search results', { users, count: users.length });
});

// @route   POST /api/users/:id/follow
// @access  Private
const toggleFollow = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, 'Invalid user id');
  }

  if (id === req.user._id.toString()) {
    throw new ApiError(400, 'You cannot follow yourself');
  }

  const targetUser = await User.findById(id);
  if (!targetUser) {
    throw new ApiError(404, 'User not found');
  }

  const currentUser = await User.findById(req.user._id);
  const alreadyFollowing = currentUser.following.some((uid) => uid.toString() === id);

  if (alreadyFollowing) {
    currentUser.following = currentUser.following.filter((uid) => uid.toString() !== id);
    targetUser.followers = targetUser.followers.filter(
      (uid) => uid.toString() !== req.user._id.toString()
    );
  } else {
    currentUser.following.push(id);
    targetUser.followers.push(req.user._id);
  }

  await Promise.all([currentUser.save(), targetUser.save()]);

  return success(res, 200, alreadyFollowing ? 'Unfollowed successfully' : 'Followed successfully', {
    following: !alreadyFollowing,
    followersCount: targetUser.followers.length,
    followingCount: currentUser.following.length,
  });
});

// @route   POST /api/users/me/avatar
// @access  Private
const uploadAvatar = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, 'No image file provided');
  }

  const user = await User.findById(req.user._id);
  if (!user) throw new ApiError(404, 'User not found');

  if (user.profileImagePublicId) {
    await cloudinary.uploader.destroy(user.profileImagePublicId).catch(() => {});
  }

  user.profileImage = req.file.path;
  user.profileImagePublicId = req.file.filename;
  await user.save();

  return success(res, 200, 'Profile photo updated', {
    profileImage: user.profileImage,
  });
});

module.exports = {
  getUserProfile,
  updateUserProfile,
  updateAvatarPreferences,
  searchUsers,
  toggleFollow,
  uploadAvatar,
  getUserStatus, // ✅ ADD THIS
};