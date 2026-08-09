const asyncHandler = require('express-async-handler');
const Highlight = require('../models/Highlight');
const ApiError = require('../utils/ApiError');
const { success } = require('../utils/apiResponse');

// @route   POST /api/highlights/create
const createHighlight = asyncHandler(async (req, res) => {
  const { name, stories, coverImage } = req.body;

  const highlight = await Highlight.create({
    user: req.user._id,
    name,
    stories,
    coverImage,
  });

  return success(res, 201, 'Highlight created', { highlight });
});

// @route   GET /api/highlights/user/:userId
const getUserHighlights = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const highlights = await Highlight.find({ user: userId })
    .populate('stories')
    .sort({ createdAt: -1 });

  return success(res, 200, 'User highlights', { highlights });
});

module.exports = { createHighlight, getUserHighlights };