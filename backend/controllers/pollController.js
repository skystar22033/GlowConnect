const asyncHandler = require('express-async-handler');
const Poll = require('../models/Poll');
const Post = require('../models/Post');
const ApiError = require('../utils/ApiError');
const { success } = require('../utils/apiResponse');

// @route   POST /api/polls/create
const createPoll = asyncHandler(async (req, res) => {
  const { postId, question, options, duration } = req.body;

  const post = await Post.findById(postId);
  if (!post) throw new ApiError(404, 'Post not found');

  const poll = await Poll.create({
    post: postId,
    question,
    options: options.map(opt => ({ text: opt, votes: [] })),
    expiresAt: new Date(+new Date() + duration * 24*60*60*1000),
  });

  return success(res, 201, 'Poll created', { poll });
});

// @route   POST /api/polls/:id/vote
const votePoll = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { optionIndex } = req.body;

  const poll = await Poll.findById(id);
  if (!poll) throw new ApiError(404, 'Poll not found');

  if (poll.expiresAt < new Date()) {
    throw new ApiError(400, 'Poll has expired');
  }

  // Check if user already voted
  for (let opt of poll.options) {
    if (opt.votes.includes(req.user._id)) {
      opt.votes = opt.votes.filter(id => id.toString() !== req.user._id.toString());
    }
  }

  // Add vote
  poll.options[optionIndex].votes.push(req.user._id);
  poll.totalVotes += 1;
  await poll.save();

  return success(res, 200, 'Vote recorded', { poll });
});

// @route   GET /api/polls/:id/results
const getPollResults = asyncHandler(async (req, res) => {
  const poll = await Poll.findById(req.params.id);
  if (!poll) throw new ApiError(404, 'Poll not found');

  const results = poll.options.map(opt => ({
    text: opt.text,
    votes: opt.votes.length,
    percentage: poll.totalVotes ? Math.round((opt.votes.length / poll.totalVotes) * 100) : 0,
  }));

  return success(res, 200, 'Poll results', { results, totalVotes: poll.totalVotes });
});

module.exports = { createPoll, votePoll, getPollResults };