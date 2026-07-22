const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: [true, 'Post content is required'],
      trim: true,
      maxlength: [2000, 'Post content cannot exceed 2000 characters'],
    },
    image: {
      type: String, // Cloudinary secure_url
      default: '',
    },
    imagePublicId: {
      type: String, // Cloudinary public_id, needed to delete the image later
      default: '',
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment',
      },
    ],
  },
  { timestamps: true }
);

postSchema.index({ author: 1, createdAt: -1 });

postSchema.virtual('likesCount').get(function () {
  return this.likes?.length || 0;
});
postSchema.virtual('commentsCount').get(function () {
  return this.comments?.length || 0;
});

postSchema.set('toJSON', { virtuals: true });
postSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Post', postSchema);
