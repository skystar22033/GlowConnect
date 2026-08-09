const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const User = require('../models/User');
const cloudinary = require('../config/cloudinary');
const ApiError = require('../utils/ApiError');
const { success } = require('../utils/apiResponse');

const AUTHOR_FIELDS = 'username fullName profileImage';
const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// ============================================
// ✅ ORIGINAL CREATE POST (for multer upload)
// ============================================
const createPost = asyncHandler(async (req, res) => {
  console.log('📝 Creating post with multer...');
  console.log('📦 req.files:', req.files ? Object.keys(req.files) : 'none');
  console.log('📦 req.body:', req.body);

  const { content } = req.body;

  if (!content || !content.trim()) {
    throw new ApiError(400, 'Post content is required');
  }

  const postData = {
    content: content.trim(),
    author: req.user._id,
    mediaType: 'none',
  };

  // Handle image upload
  if (req.files && req.files.image && req.files.image.length > 0) {
    const imageFile = req.files.image[0];
    console.log('🖼️ Image uploaded:', imageFile.path);
    postData.image = imageFile.path;
    postData.imagePublicId = imageFile.filename;
    postData.mediaType = 'image';
  }

  // Handle video upload
  if (req.files && req.files.video && req.files.video.length > 0) {
    const videoFile = req.files.video[0];
    console.log('🎬✅ Video uploaded successfully!');
    console.log('📁 Video path:', videoFile.path);
    console.log('📁 Video filename:', videoFile.filename);
    postData.video = videoFile.path;
    postData.videoPublicId = videoFile.filename;
    postData.mediaType = 'video';
  }

  if (!postData.image && !postData.video) {
    console.log('📝 No media uploaded, text-only post');
  }

  const post = await Post.create(postData);
  const populated = await post.populate('author', 'username fullName profileImage');

  return success(res, 201, 'Post created successfully', { post: populated });
});

// ============================================
// ✅ BASE64 CREATE POST (for video/image upload)
// ============================================
const createPostBase64 = asyncHandler(async (req, res) => {
  console.log('📝 Creating post from base64...');
  console.log('📦 req.body keys:', Object.keys(req.body));

  const { content, image, video } = req.body;

  if (!content || !content.trim()) {
    throw new ApiError(400, 'Post content is required');
  }

  const postData = {
    content: content.trim(),
    author: req.user._id,
    mediaType: 'none',
  };

  // Handle base64 image
  if (image && image.startsWith('data:image')) {
    console.log('🖼️ Processing base64 image...');
    const uploadResult = await cloudinary.uploader.upload(image, {
      folder: 'glowconnect/posts',
      transformation: [{ width: 1080, height: 1080, crop: 'limit', quality: 'auto' }],
    });
    console.log('✅ Image uploaded to Cloudinary:', uploadResult.secure_url);
    postData.image = uploadResult.secure_url;
    postData.imagePublicId = uploadResult.public_id;
    postData.mediaType = 'image';
  }

  // Handle base64 video
  if (video && video.startsWith('data:video')) {
    console.log('🎬 Processing base64 video...');
    const uploadResult = await cloudinary.uploader.upload(video, {
      folder: 'glowconnect/videos',
      resource_type: 'video',
      transformation: [{ width: 1080, height: 1080, crop: 'limit' }],
    });
    console.log('✅ Video uploaded to Cloudinary:', uploadResult.secure_url);
    postData.video = uploadResult.secure_url;
    postData.videoPublicId = uploadResult.public_id;
    postData.mediaType = 'video';
  }

  if (!postData.image && !postData.video) {
    console.log('📝 Text-only post');
  }

  const post = await Post.create(postData);
  const populated = await post.populate('author', 'username fullName profileImage');

  return success(res, 201, 'Post created successfully', { post: populated });
});

// ============================================
// GET POST BY ID
// ============================================
const getPostById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isValidId(id)) throw new ApiError(400, 'Invalid post id');

  const post = await Post.findById(id)
    .populate('author', AUTHOR_FIELDS)
    .populate({
      path: 'comments',
      populate: { path: 'author', select: AUTHOR_FIELDS },
      options: { sort: { createdAt: -1 } },
    });

  if (!post) throw new ApiError(404, 'Post not found');

  return success(res, 200, 'Post fetched', { post });
});

// ============================================
// UPDATE POST
// ============================================
const updatePost = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isValidId(id)) throw new ApiError(400, 'Invalid post id');

  const post = await Post.findById(id);
  if (!post) throw new ApiError(404, 'Post not found');

  if (post.author.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'You can only edit your own posts');
  }

  const { content } = req.body;
  if (content !== undefined) {
    if (!content.trim()) throw new ApiError(400, 'Post content cannot be empty');
    post.content = content.trim();
  }

  if (req.files && req.files.image && req.files.image.length > 0) {
    if (post.imagePublicId) {
      await cloudinary.uploader.destroy(post.imagePublicId).catch(() => {});
    }
    post.image = req.files.image[0].path;
    post.imagePublicId = req.files.image[0].filename;
    post.mediaType = 'image';
  }

  await post.save();
  const populated = await post.populate('author', AUTHOR_FIELDS);

  return success(res, 200, 'Post updated successfully', { post: populated });
});

// ============================================
// DELETE POST
// ============================================
const deletePost = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isValidId(id)) throw new ApiError(400, 'Invalid post id');

  const post = await Post.findById(id);
  if (!post) throw new ApiError(404, 'Post not found');

  if (post.author.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'You can only delete your own posts');
  }

  if (post.imagePublicId) {
    await cloudinary.uploader.destroy(post.imagePublicId).catch(() => {});
  }

  if (post.videoPublicId) {
    await cloudinary.uploader.destroy(post.videoPublicId, { resource_type: 'video' }).catch(() => {});
  }

  await Comment.deleteMany({ post: post._id });
  await post.deleteOne();

  return success(res, 200, 'Post deleted successfully', { postId: id });
});

// ============================================
// GET FEED
// ============================================
// ============================================
// GET FEED - FIXED to include videos
// ============================================
const getFeed = asyncHandler(async (req, res) => {
  console.log('📡 Fetching feed for user:', req.user._id);
  
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 50);
  const skip = (page - 1) * limit;

  const currentUser = await User.findById(req.user._id).select('following');
  const authorIds = [req.user._id, ...currentUser.following];
  
  console.log('👥 Author IDs:', authorIds);

  const [posts, total] = await Promise.all([
    Post.find({ author: { $in: authorIds } })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('author', 'username fullName profileImage avatarPreferences')
      .populate({
        path: 'comments',
        populate: { path: 'author', select: 'username fullName profileImage avatarPreferences' }
      }),
    Post.countDocuments({ author: { $in: authorIds } }),
  ]);

  console.log('📦 Posts found:', posts.length);
  posts.forEach((post, index) => {
    console.log(`📝 Post ${index + 1}:`, {
      id: post._id,
      content: post.content?.substring(0, 20),
      hasImage: !!post.image,
      hasVideo: !!post.video,
      mediaType: post.mediaType
    });
  });

  return success(res, 200, 'Feed fetched', { posts }, {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    hasMore: skip + posts.length < total,
  });
});
// ============================================
// GET USER POSTS
// ============================================
const getUserPosts = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  if (!isValidId(userId)) throw new ApiError(400, 'Invalid user id');

  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 50);
  const skip = (page - 1) * limit;

  const [posts, total] = await Promise.all([
    Post.find({ author: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('author', AUTHOR_FIELDS),
    Post.countDocuments({ author: userId }),
  ]);

  return success(res, 200, "User's posts fetched", { posts }, {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    hasMore: skip + posts.length < total,
  });
});

// ============================================
// TOGGLE LIKE
// ============================================
const toggleLike = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isValidId(id)) throw new ApiError(400, 'Invalid post id');

  const post = await Post.findById(id);
  if (!post) throw new ApiError(404, 'Post not found');

  const userId = req.user._id.toString();
  const alreadyLiked = post.likes.some((likeId) => likeId.toString() === userId);

  if (alreadyLiked) {
    post.likes = post.likes.filter((likeId) => likeId.toString() !== userId);
  } else {
    post.likes.push(req.user._id);
  }

  await post.save();

  return success(res, 200, alreadyLiked ? 'Post unliked' : 'Post liked', {
    liked: !alreadyLiked,
    likesCount: post.likes.length,
  });
});

// ============================================
// ✅ EXPORTS - BOTH FUNCTIONS INCLUDED
// ============================================
module.exports = {
  createPost,        // ✅ FOR MULTER UPLOAD
  createPostBase64,  // ✅ FOR BASE64 UPLOAD
  getPostById,
  updatePost,
  deletePost,
  getFeed,
  getUserPosts,
  toggleLike,
};