const mongoose = require('mongoose');

const savedSchema = new mongoose.Schema({
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
}, { timestamps: true });

// Prevent duplicate saves
savedSchema.index({ user: 1, post: 1 }, { unique: true });

module.exports = mongoose.model('Saved', savedSchema);