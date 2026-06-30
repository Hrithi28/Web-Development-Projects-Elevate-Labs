const express = require('express');
const Room = require('../models/Room');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// GET /api/rooms - Get user's rooms
router.get('/', authenticate, async (req, res) => {
  try {
    const rooms = await Room.find({ members: req.user._id })
      .populate('members', 'username avatar isOnline lastSeen')
      .populate('lastMessage')
      .populate('createdBy', 'username')
      .sort({ updatedAt: -1 });
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/rooms - Create group room
router.post('/', authenticate, async (req, res) => {
  try {
    const { name, description, members = [], isPrivate = false } = req.body;
    if (!name) return res.status(400).json({ message: 'Room name is required' });

    const allMembers = [...new Set([req.user._id.toString(), ...members])];

    const room = await Room.create({
      name,
      description,
      type: 'group',
      members: allMembers,
      admins: [req.user._id],
      createdBy: req.user._id,
      isPrivate,
    });

    await room.populate('members', 'username avatar isOnline');
    res.status(201).json(room);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/rooms/public - Get public rooms to discover
router.get('/public', authenticate, async (req, res) => {
  try {
    const rooms = await Room.find({ type: 'group', isPrivate: false })
      .populate('members', 'username avatar')
      .populate('createdBy', 'username')
      .sort({ updatedAt: -1 })
      .limit(30);
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/rooms/:id
router.get('/:id', authenticate, async (req, res) => {
  try {
    const room = await Room.findOne({ _id: req.params.id, members: req.user._id })
      .populate('members', 'username avatar isOnline lastSeen')
      .populate('admins', 'username')
      .populate('createdBy', 'username');

    if (!room) return res.status(404).json({ message: 'Room not found or access denied' });
    res.json(room);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/rooms/:id/join - Join a public room
router.post('/:id/join', authenticate, async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ message: 'Room not found' });
    if (room.isPrivate) return res.status(403).json({ message: 'Room is private' });

    if (!room.members.includes(req.user._id)) {
      room.members.push(req.user._id);
      await room.save();
    }

    await room.populate('members', 'username avatar isOnline');
    res.json(room);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/rooms/:id/leave
router.post('/:id/leave', authenticate, async (req, res) => {
  try {
    const room = await Room.findOne({ _id: req.params.id, members: req.user._id });
    if (!room) return res.status(404).json({ message: 'Room not found' });

    room.members = room.members.filter(m => m.toString() !== req.user._id.toString());
    room.admins = room.admins.filter(a => a.toString() !== req.user._id.toString());
    await room.save();

    res.json({ message: 'Left room successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/rooms/:id/members - Add member (admin only)
router.post('/:id/members', authenticate, async (req, res) => {
  try {
    const { userId } = req.body;
    const room = await Room.findOne({ _id: req.params.id, admins: req.user._id });
    if (!room) return res.status(403).json({ message: 'Access denied' });

    if (!room.members.includes(userId)) {
      room.members.push(userId);
      await room.save();
    }

    await room.populate('members', 'username avatar isOnline');
    res.json(room);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
