const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

// ✅ Temporary route until controller is ready
router.get('/', protect, (req, res) => {
  // Return empty array if no notifications
  res.json({ 
    status: 'success', 
    data: [],
    message: 'No notifications yet'
  });
});

router.put('/:id/read', protect, (req, res) => {
  res.json({ status: 'success', message: 'Marked as read' });
});

router.put('/read-all', protect, (req, res) => {
  res.json({ status: 'success', message: 'All marked as read' });
});

router.delete('/:id', protect, (req, res) => {
  res.json({ status: 'success', message: 'Deleted' });
});

module.exports = router;