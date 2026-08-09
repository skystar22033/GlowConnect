const asyncHandler = require('express-async-handler');
const Message = require('../models/Message');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const { success } = require('../utils/apiResponse');

const getMessages = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const messages = await Message.find({
    $or: [
      { sender: req.user._id, recipient: userId },
      { sender: userId, recipient: req.user._id },
    ],
  })
    .sort({ createdAt: 1 })
    .populate('sender', 'username fullName profileImage')
    .populate('recipient', 'username fullName profileImage');

  await Message.updateMany(
    { sender: userId, recipient: req.user._id, read: false },
    { read: true, readAt: new Date() }
  );

  return success(res, 200, 'Messages fetched', { messages });
});

const sendMessage = asyncHandler(async (req, res) => {
  const { recipient, content } = req.body;
  if (!recipient) throw new ApiError(400, 'Recipient is required');
  if (!content || !content.trim()) throw new ApiError(400, 'Message content is required');

  const recipientUser = await User.findById(recipient);
  if (!recipientUser) throw new ApiError(404, 'Recipient not found');

  const message = await Message.create({
    sender: req.user._id,
    recipient,
    content: content.trim(),
  });

  const populated = await message.populate('sender', 'username fullName profileImage');
  await populated.populate('recipient', 'username fullName profileImage');

  const io = req.app.get('io');
  if (io) {
    io.to(`user_${recipient}`).emit('new-message', populated);
  }

  return success(res, 201, 'Message sent', { message: populated });
});

const getConversations = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const conversations = await Message.aggregate([
    { $match: { $or: [{ sender: userId }, { recipient: userId }] } },
    { $sort: { createdAt: -1 } },
    {
      $group: {
        _id: { $cond: [{ $eq: ['$sender', userId] }, '$recipient', '$sender'] },
        lastMessage: { $first: '$$ROOT' },
        unreadCount: {
          $sum: {
            $cond: [
              { $and: [{ $eq: ['$recipient', userId] }, { $eq: ['$read', false] }] },
              1,
              0,
            ],
          },
        },
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'user',
      },
    },
    { $unwind: '$user' },
    {
      $project: {
        user: { _id: 1, username: 1, fullName: 1, profileImage: 1, avatarPreferences: 1 },
        lastMessage: 1,
        unreadCount: 1,
      },
    },
    { $sort: { 'lastMessage.createdAt': -1 } },
  ]);

  return success(res, 200, 'Conversations fetched', { conversations });
});

module.exports = { getMessages, sendMessage, getConversations };