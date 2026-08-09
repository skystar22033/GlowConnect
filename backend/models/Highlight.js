const mongoose = require('mongoose');

const highlightSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  stories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Story',
  }],
  coverImage: {
    type: String,
    default: '',
  },
}, { timestamps: true });

module.exports = mongoose.model('Highlight', highlightSchema);