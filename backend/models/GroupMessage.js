const mongoose = require('mongoose');

const groupMessageSchema = new mongoose.Schema({
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    required: true,
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  content: {
    type: String,
    trim: true,
  },
  voiceNote: {
    type: String,
    default: '',
  },
  reactions: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    emoji: {
      type: String,
    },
  }],
}, { timestamps: true });

module.exports = mongoose.model('GroupMessage', groupMessageSchema);