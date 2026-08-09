const mongoose = require('mongoose');

const pollSchema = new mongoose.Schema({
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: true,
  },
  question: {
    type: String,
    required: true,
    trim: true,
  },
  options: [{
    text: {
      type: String,
      required: true,
      trim: true,
    },
    votes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
  }],
  totalVotes: {
    type: Number,
    default: 0,
  },
  expiresAt: {
    type: Date,
    default: () => new Date(+new Date() + 7*24*60*60*1000), // 7 days
  },
}, { timestamps: true });

module.exports = mongoose.model('Poll', pollSchema);