const asyncHandler = require('express-async-handler');
const Hashtag = require('../models/Hashtag');
const Post = require('../models/Post');
const { success } = require('../utils/apiResponse');

// Extract hashtags from text
const extractHashtags = (text) => {
  const matches = text.match(/#[a-zA-Z0-9_]+/g);
  return matches ? matches.map(tag => tag.slice(1).toLowerCase()) : [];
};

// @route   GET /api/hashtags/trending
const getTrendingHashtags = asyncHandler(async (req, res) => {
  const hashtags = await Hashtag.find()
    .sort({ postCount: -1 })
    .limit(10);
  return success(res, 200, 'Trending hashtags', { hashtags });
});

// @route   GET /api/posts/hashtag/:name
const getPostsByHashtag = asyncHandler(async (req, res) => {
  const { name } = req.params;
  
  const posts = await Post.find({
    content: { $regex: `#${name}`, $options: 'i' }
  })
    .populate('author', 'username fullName profileImage')
    .sort({ createdAt: -1 });

  return success(res, 200, `Posts with #${name}`, { posts });
});

module.exports = { extractHashtags, getTrendingHashtags, getPostsByHashtag };