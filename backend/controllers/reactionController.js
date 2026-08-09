const asyncHandler = require('express-async-handler');
const Reaction = require('../models/Reaction');
const Post = require('../models/Post');
const ApiError = require('../utils/ApiError');
const { success } = require('../utils/apiResponse');

const EMOJIS = ['❤️', '😂', '😮', '😢', '🔥', '👍', '👏', '💯', '🤩', '😍'];

// @route   POST /api/posts/:id/reaction
const addReaction = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { emoji } = req.body;

  if (!EMOJIS.includes(emoji)) {
    throw new ApiError(400, 'Invalid emoji');
  }

  const post = await Post.findById(id);
  if (!post) throw new ApiError(404, 'Post not found');

  // Check if user already reacted
  const existing = await Reaction.findOne({ user: req.user._id, post: id });
  if (existing) {
    if (existing.emoji === emoji) {
      await existing.deleteOne();
      return success(res, 200, 'Reaction removed');
    }
    existing.emoji = emoji;
    await existing.save();
    return success(res, 200, 'Reaction updated');
  }

  await Reaction.create({ user: req.user._id, post: id, emoji });
  return success(res, 200, 'Reaction added');
});

// @route   GET /api/posts/:id/reactions
const getReactions = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const reactions = await Reaction.find({ post: id })
    .populate('user', 'username fullName profileImage');

  // Group by emoji
  const grouped = {};
  reactions.forEach(r => {
    grouped[r.emoji] = (grouped[r.emoji] || 0) + 1;
  });

  return success(res, 200, 'Reactions fetched', {
    reactions,
    summary: grouped,
  });
});

module.exports = { addReaction, getReactions, EMOJIS };