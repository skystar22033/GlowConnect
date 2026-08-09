const asyncHandler = require('express-async-handler');
const Post = require('../models/Post');
const ApiError = require('../utils/ApiError');
const { success } = require('../utils/apiResponse');

// @route   POST /api/posts/schedule
const schedulePost = asyncHandler(async (req, res) => {
  const { content, image, video, scheduledAt } = req.body;

  if (!scheduledAt || new Date(scheduledAt) < new Date()) {
    throw new ApiError(400, 'Invalid scheduled date');
  }

  const post = await Post.create({
    content,
    image,
    video,
    author: req.user._id,
    scheduledAt: new Date(scheduledAt),
    status: 'scheduled',
  });

  return success(res, 201, 'Post scheduled', { post });
});

// @route   GET /api/posts/scheduled
const getScheduledPosts = asyncHandler(async (req, res) => {
  const posts = await Post.find({
    author: req.user._id,
    status: 'scheduled',
  }).sort({ scheduledAt: 1 });

  return success(res, 200, 'Scheduled posts', { posts });
});

module.exports = { schedulePost, getScheduledPosts };