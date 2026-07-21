const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const { success } = require('../utils/apiResponse');

// @route   GET /api/users/:id
// @access  Public
const getUserProfile = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, 'Invalid user id');
  }

  const user = await User.findById(id).populate('followers', 'username fullName profileImage').populate(
    'following',
    'username fullName profileImage'
  );

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
      followers: user.followers,
      following: user.following,
      followersCount: user.followers.length,
      followingCount: user.following.length,
      createdAt: user.createdAt,
    },
  });
});

// @route   PUT /api/users/:id
// @access  Private (only the owner can update their own profile)
const updateUserProfile = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, 'Invalid user id');
  }

  if (id !== req.user._id.toString()) {
    throw new ApiError(403, 'You can only update your own profile');
  }

  // Whitelist updatable fields — never let the client set followers, password, etc. here
  const allowedFields = ['fullName', 'bio', 'profileImage'];
  const updates = {};
  for (const field of allowedFields) {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  }

  const user = await User.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true,
  });

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
    .select('username fullName profileImage bio')
    .limit(20);

  return success(res, 200, 'Search results', { users, count: users.length });
});

module.exports = { getUserProfile, updateUserProfile, searchUsers };
