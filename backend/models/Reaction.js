const mongoose = require('mongoose');

const reactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: true,
  },
  emoji: {
    type: String,
    enum: ['❤️', '😂', '😮', '😢', '🔥', '👍', '👏', '💯', '🤩', '😍'],
    required: true,
  },
}, { timestamps: true });

// Prevent duplicate reactions
reactionSchema.index({ user: 1, post: 1 }, { unique: true });

module.exports = mongoose.model('Reaction', reactionSchema);