const asyncHandler = require('express-async-handler');
const Group = require('../models/Group');
const GroupMessage = require('../models/GroupMessage');
const ApiError = require('../utils/ApiError');
const { success } = require('../utils/apiResponse');

// @route   POST /api/groups/create
const createGroup = asyncHandler(async (req, res) => {
  const { name, members } = req.body;

  const group = await Group.create({
    name,
    members: [req.user._id, ...members],
    admin: req.user._id,
  });

  return success(res, 201, 'Group created', { group });
});

// @route   GET /api/groups
const getGroups = asyncHandler(async (req, res) => {
  const groups = await Group.find({ members: req.user._id })
    .populate('members', 'username fullName profileImage')
    .populate('lastMessage')
    .sort({ updatedAt: -1 });

  return success(res, 200, 'Groups fetched', { groups });
});

// @route   GET /api/groups/:id/messages
const getGroupMessages = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const messages = await GroupMessage.find({ group: id })
    .populate('sender', 'username fullName profileImage')
    .sort({ createdAt: 1 });

  return success(res, 200, 'Messages fetched', { messages });
});

// @route   POST /api/groups/:id/message
const sendGroupMessage = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;

  const group = await Group.findById(id);
  if (!group) throw new ApiError(404, 'Group not found');

  const message = await GroupMessage.create({
    group: id,
    sender: req.user._id,
    content,
  });

  await Group.findByIdAndUpdate(id, { lastMessage: message._id });
  const populated = await message.populate('sender', 'username fullName profileImage');

  // Emit via socket
  const io = req.app.get('io');
  if (io) {
    io.to(`group_${id}`).emit('group-message', populated);
  }

  return success(res, 201, 'Message sent', { message: populated });
});

// @route   POST /api/groups/:id/add-member
const addMember = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;

  const group = await Group.findById(id);
  if (!group) throw new ApiError(404, 'Group not found');

  if (group.admin.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Only admin can add members');
  }

  if (group.members.includes(userId)) {
    throw new ApiError(400, 'User already in group');
  }

  group.members.push(userId);
  await group.save();

  return success(res, 200, 'Member added', { group });
});

// @route   POST /api/groups/:id/remove-member
const removeMember = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;

  const group = await Group.findById(id);
  if (!group) throw new ApiError(404, 'Group not found');

  if (group.admin.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Only admin can remove members');
  }

  group.members = group.members.filter(id => id.toString() !== userId);
  await group.save();

  return success(res, 200, 'Member removed', { group });
});

module.exports = {
  createGroup,
  getGroups,
  getGroupMessages,
  sendGroupMessage,
  addMember,
  removeMember,
};