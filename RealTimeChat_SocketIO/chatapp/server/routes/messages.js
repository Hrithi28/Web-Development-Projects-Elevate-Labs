const express = require('express');
const Message = require('../models/Message');
const Room = require('../models/Room');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// GET /api/messages/:roomId - Get messages for a room
router.get('/:roomId', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;

    const room = await Room.findOne({ _id: req.params.roomId, members: req.user._id });
    if (!room) return res.status(403).json({ message: 'Access denied' });

    const messages = await Message.find({
      room: req.params.roomId,
      deletedAt: null,
    })
      .populate('sender', 'username avatar')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Message.countDocuments({ room: req.params.roomId, deletedAt: null });

    res.json({
      messages: messages.reverse(),
      pagination: { page: parseInt(page), limit: parseInt(limit), total },
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/messages/:id - Delete own message
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const message = await Message.findOne({ _id: req.params.id, sender: req.user._id });
    if (!message) return res.status(404).json({ message: 'Message not found or not yours' });

    message.deletedAt = new Date();
    message.content = 'This message was deleted';
    await message.save();

    res.json({ message: 'Message deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PATCH /api/messages/:id - Edit own message
router.patch('/:id', authenticate, async (req, res) => {
  try {
    const { content } = req.body;
    const message = await Message.findOne({ _id: req.params.id, sender: req.user._id });
    if (!message) return res.status(404).json({ message: 'Message not found or not yours' });

    message.content = content;
    message.edited = true;
    await message.save();

    await message.populate('sender', 'username avatar');
    res.json(message);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
