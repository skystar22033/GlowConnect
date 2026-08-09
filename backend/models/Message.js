const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: [1000, 'Message cannot exceed 1000 characters'],
  },
  read: {
    type: Boolean,
    default: false,
  },
  readAt: {
    type: Date,
  },
}, { timestamps: true });

messageSchema.index({ sender: 1, recipient: 1, createdAt: -1 });

module.exports = mongoose.model('Message', messageSchema);