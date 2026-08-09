const asyncHandler = require('express-async-handler');
const Saved = require('../models/Saved');
const Post = require('../models/Post');
const ApiError = require('../utils/ApiError');
const { success } = require('../utils/apiResponse');

// @route   POST /api/posts/:id/save
const savePost = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const post = await Post.findById(id);
  if (!post) throw new ApiError(404, 'Post not found');

  const existing = await Saved.findOne({ user: req.user._id, post: id });
  if (existing) {
    await existing.deleteOne();
    return success(res, 200, 'Post unsaved');
  }

  await Saved.create({ user: req.user._id, post: id });
  return success(res, 200, 'Post saved');
});

// @route   GET /api/posts/saved
const getSavedPosts = asyncHandler(async (req, res) => {
  const saved = await Saved.find({ user: req.user._id })
    .populate({
      path: 'post',
      populate: { path: 'author', select: 'username fullName profileImage' },
    })
    .sort({ createdAt: -1 });

  const posts = saved.map(s => s.post);
  return success(res, 200, 'Saved posts fetched', { posts });
});

module.exports = { savePost, getSavedPosts };