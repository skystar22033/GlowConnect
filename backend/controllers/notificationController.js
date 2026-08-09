const asyncHandler = require('express-async-handler');
const Notification = require('../models/Notification');
const ApiError = require('../utils/ApiError');
const { success } = require('../utils/apiResponse');

// @route   GET /api/notifications
// @access  Private
const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ recipient: req.user._id })
    .populate('sender', 'username fullName profileImage')
    .populate('post', 'content image')
    .sort({ createdAt: -1 })
    .limit(50);

  return success(res, 200, 'Notifications fetched', { notifications });
});

// @route   PUT /api/notifications/:id/read
// @access  Private
const markAsRead = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const notification = await Notification.findOneAndUpdate(
    { _id: id, recipient: req.user._id },
    { read: true },
    { new: true }
  );

  if (!notification) {
    throw new ApiError(404, 'Notification not found');
  }

  return success(res, 200, 'Notification marked as read', { notification });
});

// @route   PUT /api/notifications/read-all
// @access  Private
const markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { recipient: req.user._id, read: false },
    { read: true }
  );

  return success(res, 200, 'All notifications marked as read');
});

// @route   DELETE /api/notifications/:id
// @access  Private
const deleteNotification = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const notification = await Notification.findOneAndDelete({
    _id: id,
    recipient: req.user._id,
  });

  if (!notification) {
    throw new ApiError(404, 'Notification not found');
  }

  return success(res, 200, 'Notification deleted');
});

// @route   POST /api/notifications/create
// @access  Private (Internal)
const createNotification = async (senderId, recipientId, type, message, postId = null, commentId = null) => {
  try {
    const notification = await Notification.create({
      sender: senderId,
      recipient: recipientId,
      type,
      message,
      post: postId,
      comment: commentId,
    });

    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  createNotification,
};