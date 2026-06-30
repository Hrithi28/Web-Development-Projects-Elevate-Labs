const Message = require('./models/Message');
const User = require('./models/User');
const Room = require('./models/Room');

// Track online users: userId -> socketId
const onlineUsers = new Map();

module.exports = (io) => {
  io.on('connection', async (socket) => {
    const userId = socket.user.id;
    console.log(`🔌 User connected: ${socket.user.username} (${socket.id})`);

    // Mark user online
    onlineUsers.set(userId, socket.id);
    await User.findByIdAndUpdate(userId, { isOnline: true, lastSeen: new Date() });
    io.emit('user:online', { userId, isOnline: true });

    // Join user's rooms
    socket.on('join:rooms', async () => {
      try {
        const rooms = await Room.find({ members: userId });
        rooms.forEach(room => socket.join(room._id.toString()));
        socket.emit('rooms:joined', rooms.map(r => r._id.toString()));
      } catch (err) {
        socket.emit('error', { message: 'Failed to join rooms' });
      }
    });

    // Join a specific room
    socket.on('room:join', async ({ roomId }) => {
      try {
        const room = await Room.findOne({ _id: roomId, members: userId });
        if (!room) return socket.emit('error', { message: 'Access denied' });
        socket.join(roomId);
        socket.emit('room:joined', { roomId });
      } catch (err) {
        socket.emit('error', { message: 'Failed to join room' });
      }
    });

    // Send message to a room
    socket.on('message:send', async ({ roomId, content, type = 'text' }) => {
      try {
        const room = await Room.findOne({ _id: roomId, members: userId });
        if (!room) return socket.emit('error', { message: 'Access denied' });

        const message = await Message.create({
          room: roomId,
          sender: userId,
          content,
          type,
        });

        await message.populate('sender', 'username avatar');
        await Room.findByIdAndUpdate(roomId, { lastMessage: message._id, updatedAt: new Date() });

        io.to(roomId).emit('message:new', message);
      } catch (err) {
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Typing indicators
    socket.on('typing:start', ({ roomId }) => {
      socket.to(roomId).emit('typing:update', {
        userId,
        username: socket.user.username,
        roomId,
        isTyping: true,
      });
    });

    socket.on('typing:stop', ({ roomId }) => {
      socket.to(roomId).emit('typing:update', {
        userId,
        username: socket.user.username,
        roomId,
        isTyping: false,
      });
    });

    // Private message (DM)
    socket.on('dm:send', async ({ recipientId, content }) => {
      try {
        // Find or create DM room
        let room = await Room.findOne({
          type: 'dm',
          members: { $all: [userId, recipientId], $size: 2 },
        });

        if (!room) {
          room = await Room.create({
            type: 'dm',
            members: [userId, recipientId],
            name: `dm_${userId}_${recipientId}`,
          });
        }

        const message = await Message.create({
          room: room._id,
          sender: userId,
          content,
          type: 'text',
        });

        await message.populate('sender', 'username avatar');
        await Room.findByIdAndUpdate(room._id, { lastMessage: message._id, updatedAt: new Date() });

        // Send to both users
        const recipientSocketId = onlineUsers.get(recipientId);
        socket.emit('dm:new', { room, message });
        if (recipientSocketId) {
          io.to(recipientSocketId).emit('dm:new', { room, message });
        }
      } catch (err) {
        socket.emit('error', { message: 'Failed to send DM' });
      }
    });

    // Message read receipt
    socket.on('message:read', async ({ roomId }) => {
      try {
        await Message.updateMany(
          { room: roomId, sender: { $ne: userId }, readBy: { $ne: userId } },
          { $addToSet: { readBy: userId } }
        );
        socket.to(roomId).emit('message:read', { roomId, userId });
      } catch (err) {
        console.error('Read receipt error:', err);
      }
    });

    // Disconnect
    socket.on('disconnect', async () => {
      console.log(`❌ User disconnected: ${socket.user.username}`);
      onlineUsers.delete(userId);
      await User.findByIdAndUpdate(userId, { isOnline: false, lastSeen: new Date() });
      io.emit('user:online', { userId, isOnline: false });
    });
  });
};
