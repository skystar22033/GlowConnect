const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  createGroup,
  getGroups,
  getGroupMessages,
  sendGroupMessage,
  addMember,
  removeMember,
} = require('../controllers/groupController');

router.post('/create', protect, createGroup);
router.get('/', protect, getGroups);
router.get('/:id/messages', protect, getGroupMessages);
router.post('/:id/message', protect, sendGroupMessage);
router.post('/:id/add-member', protect, addMember);
router.post('/:id/remove-member', protect, removeMember);

module.exports = router;