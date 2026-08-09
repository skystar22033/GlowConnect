const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');
const ApiError = require('../utils/ApiError');

// ============================================
// STORAGE CONFIGURATIONS
// ============================================

// Image storage
const imageStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'glowconnect/posts',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif', 'avif'],
    transformation: [{ width: 1080, height: 1080, crop: 'limit', quality: 'auto' }],
  },
});

// Avatar storage
const avatarStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'glowconnect/avatars',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif', 'avif'],
    transformation: [{ width: 512, height: 512, crop: 'fill', gravity: 'face', quality: 'auto' }],
  },
});

// ✅ Video storage - with resource_type: 'video'
const videoStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'glowconnect/videos',
    resource_type: 'video',
    allowed_formats: ['mp4', 'mov', 'avi', 'webm', 'mkv', '3gp'],
    transformation: [{ width: 1080, height: 1080, crop: 'limit' }],
  },
});

// ============================================
// FILE FILTERS
// ============================================

const imageFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new ApiError(400, `Only image files are allowed. Received: ${file.mimetype}`), false);
  }
};

const videoFilter = (req, file, cb) => {
  const allowedTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm', 'video/3gpp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new ApiError(400, `Only video files are allowed. Received: ${file.mimetype}`), false);
  }
};

// ============================================
// MULTER INSTANCES
// ============================================

// For image uploads
const uploadImage = multer({
  storage: imageStorage,
  fileFilter: imageFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
});

// For video uploads
const uploadVideo = multer({
  storage: videoStorage,
  fileFilter: videoFilter,
  limits: { fileSize: 100 * 1024 * 1024 },
});

// For avatar uploads
const uploadAvatar = multer({
  storage: avatarStorage,
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

// ============================================
// ✅ FIX: Separate middleware for image and video
// ============================================

// For image-only posts
const uploadPostImage = uploadImage.single('image');

// For video-only posts
const uploadPostVideo = uploadVideo.single('video');

// ============================================
// ✅ SMARTER: Check file type and route accordingly
// ============================================
const uploadPostMedia = (req, res, next) => {
  // Check content-type
  if (!req.headers['content-type']?.includes('multipart/form-data')) {
    return next();
  }

  // Use multer to parse the multipart form
  const multerUpload = multer({
    storage: imageStorage, // temporary
    limits: { fileSize: 100 * 1024 * 1024 },
  }).fields([
    { name: 'image', maxCount: 1 },
    { name: 'video', maxCount: 1 },
  ]);

  multerUpload(req, res, (err) => {
    if (err) {
      console.error('❌ Multer error:', err);
      return next(new ApiError(400, err.message));
    }

    // Check if video was uploaded
    if (req.files && req.files.video && req.files.video.length > 0) {
      const videoFile = req.files.video[0];
      console.log('🎬 Video detected:', videoFile.originalname);
      
      // ✅ Delete the temporary file and upload to video storage
      // Re-upload using video storage
      const videoMulter = multer({
        storage: videoStorage,
        fileFilter: videoFilter,
        limits: { fileSize: 100 * 1024 * 1024 },
      }).fields([
        { name: 'video', maxCount: 1 },
      ]);

      // Process with video storage
      videoMulter(req, res, (videoErr) => {
        if (videoErr) {
          console.error('❌ Video upload error:', videoErr);
          return next(new ApiError(400, videoErr.message));
        }
        console.log('✅ Video uploaded to Cloudinary!');
        next();
      });
    } else {
      // Image or no media
      next();
    }
  });
};

module.exports = {
  uploadImage,
  uploadVideo,
  uploadAvatar,
  uploadPostImage,
  uploadPostVideo,
  uploadPostMedia,
};