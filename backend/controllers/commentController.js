const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const Comment = require('../models/Comment');
const Post = require('../models/Post');
const ApiError = require('../utils/ApiError');
const { success } = require('../utils/apiResponse');

const AUTHOR_FIELDS = 'username fullName profileImage';
const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// @route   POST /api/comments/post/:postId
// @access  Private
const addComment = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  const { content } = req.body;

  if (!isValidId(postId)) throw new ApiError(400, 'Invalid post id');
  if (!content || !content.trim()) throw new ApiError(400, 'Comment content is required');

  const post = await Post.findById(postId);
  if (!post) throw new ApiError(404, 'Post not found');

  const comment = await Comment.create({
    content: content.trim(),
    author: req.user._id,
    post: postId,
  });

  post.comments.push(comment._id);
  await post.save();

  const populated = await comment.populate('author', AUTHOR_FIELDS);

  return success(res, 201, 'Comment added successfully', { comment: populated });
});

// @route   GET /api/comments/post/:postId
// @access  Private
const getComments = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  if (!isValidId(postId)) throw new ApiError(400, 'Invalid post id');

  const comments = await Comment.find({ post: postId })
    .populate('author', AUTHOR_FIELDS)
    .sort({ createdAt: -1 });

  return success(res, 200, 'Comments fetched', { comments });
});

// @route   PUT /api/comments/:id
// @access  Private
const updateComment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;

  if (!isValidId(id)) throw new ApiError(400, 'Invalid comment id');
  if (!content || !content.trim()) throw new ApiError(400, 'Comment content is required');

  const comment = await Comment.findById(id);
  if (!comment) throw new ApiError(404, 'Comment not found');

  if (comment.author.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'You can only edit your own comments');
  }

  comment.content = content.trim();
  await comment.save();
  await comment.populate('author', AUTHOR_FIELDS);

  return success(res, 200, 'Comment updated successfully', { comment });
});

// @route   DELETE /api/comments/:id
// @access  Private
const deleteComment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isValidId(id)) throw new ApiError(400, 'Invalid comment id');

  const comment = await Comment.findById(id);
  if (!comment) throw new ApiError(404, 'Comment not found');

  if (comment.author.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'You can only delete your own comments');
  }

  await Post.findByIdAndUpdate(comment.post, { $pull: { comments: comment._id } });
  await comment.deleteOne();

  return success(res, 200, 'Comment deleted successfully', { commentId: id });
});

module.exports = { addComment, getComments, updateComment, deleteComment };