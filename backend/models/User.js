const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      minlength: [3, 'Username must be at least 3 characters'],
      maxlength: [30, 'Username cannot exceed 30 characters'],
      match: [/^[a-zA-Z0-9_.]+$/, 'Username can only contain letters, numbers, underscores and dots'],
      lowercase: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false,
    },
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      maxlength: [60, 'Full name cannot exceed 60 characters'],
    },
    bio: {
      type: String,
      default: '',
      maxlength: [160, 'Bio cannot exceed 160 characters'],
    },
    profileImage: {
      type: String,
      default: '',
    },
    
    profileImagePublicId: {
      type: String,
      default: '',
    },
    // ✅ SIMPLIFIED: Only store selected avatar ID
    avatarPreferences: {
      selectedAvatar: { type: String, default: 'avatar1' },
      avatarImage: { type: String, default: '' },
    },
    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    following: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    // Add to existing schema
lastActive: {
  type: Date,
  default: Date.now,
},
isOnline: {
  type: Boolean,
  default: false,
},
savedPosts: [{
  type: mongoose.Schema.Types.ObjectId,
  ref: 'Post',
}],
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Virtual counts
userSchema.virtual('followersCount').get(function () {
  return this.followers?.length || 0;
});
userSchema.virtual('followingCount').get(function () {
  return this.following?.length || 0;
});

userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('User', userSchema);