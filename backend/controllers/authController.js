const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const ApiError = require('../utils/ApiError');
const { success } = require('../utils/apiResponse');

// Strips fields we never want to send back to the client
const sanitizeUser = (user) => ({
  _id: user._id,
  username: user.username,
  email: user.email,
  fullName: user.fullName,
  bio: user.bio,
  profileImage: user.profileImage,
  followersCount: user.followers?.length || 0,
  followingCount: user.following?.length || 0,
  createdAt: user.createdAt,
});

// @route   POST /api/auth/register
// @access  Public
const register = asyncHandler(async (req, res) => {
  const { username, email, password, fullName } = req.body;

  const existingUser = await User.findOne({ $or: [{ email }, { username }] });
  if (existingUser) {
    const field = existingUser.email === email ? 'Email' : 'Username';
    throw new ApiError(409, `${field} is already registered`);
  }

  const user = await User.create({ username, email, password, fullName });
  const token = generateToken(user._id);

  return success(res, 201, 'Registration successful', {
    user: sanitizeUser(user),
    token,
  });
});

// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // password has select:false on the schema, so explicitly request it
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const token = generateToken(user._id);

  return success(res, 200, 'Login successful', {
    user: sanitizeUser(user),
    token,
  });
});

// @route   GET /api/auth/verify
// @access  Private (just confirms the token is valid)
const verify = asyncHandler(async (req, res) => {
  return success(res, 200, 'Token is valid', { userId: req.user._id });
});

// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  return success(res, 200, 'Current user fetched', { user: sanitizeUser(user) });
});

module.exports = { register, login, verify, getMe, sanitizeUser };
