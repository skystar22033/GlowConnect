const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const User = require('../models/User');
const cloudinary = require('../config/cloudinary');
const ApiError = require('../utils/ApiError');
const { success } = require('../utils/apiResponse');

const AUTHOR_FIELDS = 'username fullName profileImage';

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// @route   POST /api/posts
// @access  Private
const createPost = asyncHandler(async (req, res) => {
  const { content } = req.body;

  if (!content || !content.trim()) {
    throw new ApiError(400, 'Post content is required');
  }

  const postData = {
    content: content.trim(),
    author: req.user._id,
  };

  // req.file is populated by the `upload` (multer + Cloudinary) middleware when an image is sent
  if (req.file) {
    postData.image = req.file.path; // secure_url
    postData.imagePublicId = req.file.filename; // public_id
  }

  const post = await Post.create(postData);
  const populated = await post.populate('author', AUTHOR_FIELDS);

  return success(res, 201, 'Post created successfully', { post: populated });
});

// @route   GET /api/posts/:id
// @access  Public
const getPostById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isValidId(id)) throw new ApiError(400, 'Invalid post id');

  const post = await Post.findById(id)
    .populate('author', AUTHOR_FIELDS)
    .populate({
      path: 'comments',
      populate: { path: 'author', select: AUTHOR_FIELDS },
      options: { sort: { createdAt: -1 } },
    });

  if (!post) throw new ApiError(404, 'Post not found');

  return success(res, 200, 'Post fetched', { post });
});

// @route   PUT /api/posts/:id
// @access  Private (owner only)
const updatePost = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isValidId(id)) throw new ApiError(400, 'Invalid post id');

  const post = await Post.findById(id);
  if (!post) throw new ApiError(404, 'Post not found');

  if (post.author.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'You can only edit your own posts');
  }

  const { content } = req.body;
  if (content !== undefined) {
    if (!content.trim()) throw new ApiError(400, 'Post content cannot be empty');
    post.content = content.trim();
  }

  // Optional new image replaces the old one; delete the old Cloudinary asset to avoid orphaned files
  if (req.file) {
    if (post.imagePublicId) {
      await cloudinary.uploader.destroy(post.imagePublicId).catch(() => {});
    }
    post.image = req.file.path;
    post.imagePublicId = req.file.filename;
  }

  await post.save();
  const populated = await post.populate('author', AUTHOR_FIELDS);

  return success(res, 200, 'Post updated successfully', { post: populated });
});

// @route   DELETE /api/posts/:id
// @access  Private (owner only)
const deletePost = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isValidId(id)) throw new ApiError(400, 'Invalid post id');

  const post = await Post.findById(id);
  if (!post) throw new ApiError(404, 'Post not found');

  if (post.author.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'You can only delete your own posts');
  }

  if (post.imagePublicId) {
    await cloudinary.uploader.destroy(post.imagePublicId).catch(() => {});
  }

  await Comment.deleteMany({ post: post._id });
  await post.deleteOne();

  return success(res, 200, 'Post deleted successfully', { postId: id });
});

// @route   GET /api/posts/feed?page=1&limit=10
// @access  Private (needs req.user to know who they follow)
const getFeed = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 50);
  const skip = (page - 1) * limit;

  const currentUser = await User.findById(req.user._id).select('following');
  // Feed includes the user's own posts plus everyone they follow
  const authorIds = [req.user._id, ...currentUser.following];

  const [posts, total] = await Promise.all([
    Post.find({ author: { $in: authorIds } })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('author', AUTHOR_FIELDS),
    Post.countDocuments({ author: { $in: authorIds } }),
  ]);

  return success(res, 200, 'Feed fetched', { posts }, {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    hasMore: skip + posts.length < total,
  });
});

// @route   GET /api/posts/user/:userId?page=1&limit=10
// @access  Public
const getUserPosts = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  if (!isValidId(userId)) throw new ApiError(400, 'Invalid user id');

  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 50);
  const skip = (page - 1) * limit;

  const [posts, total] = await Promise.all([
    Post.find({ author: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('author', AUTHOR_FIELDS),
    Post.countDocuments({ author: userId }),
  ]);

  return success(res, 200, "User's posts fetched", { posts }, {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    hasMore: skip + posts.length < total,
  });
});

// @route   POST /api/posts/:id/like
// @access  Private
const toggleLike = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isValidId(id)) throw new ApiError(400, 'Invalid post id');

  const post = await Post.findById(id);
  if (!post) throw new ApiError(404, 'Post not found');

  const userId = req.user._id.toString();
  const alreadyLiked = post.likes.some((likeId) => likeId.toString() === userId);

  if (alreadyLiked) {
    post.likes = post.likes.filter((likeId) => likeId.toString() !== userId);
  } else {
    post.likes.push(req.user._id);
  }

  await post.save();

  return success(res, 200, alreadyLiked ? 'Post unliked' : 'Post liked', {
    liked: !alreadyLiked,
    likesCount: post.likes.length,
  });
});

module.exports = {
  createPost,
  getPostById,
  updatePost,
  deletePost,
  getFeed,
  getUserPosts,
  toggleLike,
};
