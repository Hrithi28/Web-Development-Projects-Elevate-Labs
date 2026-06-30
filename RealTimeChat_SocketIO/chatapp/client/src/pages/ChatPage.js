import React, { useState, useEffect, useCallback } from 'react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import ChatWindow from '../components/ChatWindow';
import WelcomeScreen from '../components/WelcomeScreen';
import api from '../utils/api';

export default function ChatPage() {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [rooms, setRooms] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [loadingRooms, setLoadingRooms] = useState(true);

  // Fetch user's rooms
  const fetchRooms = useCallback(async () => {
    try {
      const res = await api.get('/rooms');
      setRooms(res.data);
    } catch (err) {
      console.error('Failed to fetch rooms:', err);
    } finally {
      setLoadingRooms(false);
    }
  }, []);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  // Socket events for room/online updates
  useEffect(() => {
    if (!socket) return;

    socket.on('user:online', ({ userId, isOnline }) => {
      setOnlineUsers(prev => {
        const next = new Set(prev);
        if (isOnline) next.add(userId);
        else next.delete(userId);
        return next;
      });
    });

    socket.on('message:new', (message) => {
      setRooms(prev => prev.map(r =>
        r._id === message.room
          ? { ...r, lastMessage: message, updatedAt: new Date().toISOString() }
          : r
      ).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)));
    });

    socket.on('dm:new', ({ room, message }) => {
      setRooms(prev => {
        const exists = prev.find(r => r._id === room._id);
        if (!exists) return [{ ...room, lastMessage: message }, ...prev];
        return prev.map(r =>
          r._id === room._id ? { ...r, lastMessage: message, updatedAt: new Date().toISOString() } : r
        ).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
      });
    });

    return () => {
      socket.off('user:online');
      socket.off('message:new');
      socket.off('dm:new');
    };
  }, [socket]);

  const handleRoomCreated = (newRoom) => {
    setRooms(prev => [newRoom, ...prev]);
    setActiveRoom(newRoom);
  };

  const handleRoomJoined = (room) => {
    setRooms(prev => {
      if (prev.find(r => r._id === room._id)) return prev;
      return [room, ...prev];
    });
    setActiveRoom(room);
  };

  const handleSelectRoom = (room) => {
    setActiveRoom(room);
    if (socket) socket.emit('room:join', { roomId: room._id });
  };

  return (
    <div className="flex h-screen bg-dark-900 overflow-hidden">
      <Sidebar
        rooms={rooms}
        activeRoom={activeRoom}
        onSelectRoom={handleSelectRoom}
        onRoomCreated={handleRoomCreated}
        onRoomJoined={handleRoomJoined}
        onlineUsers={onlineUsers}
        currentUser={user}
        loadingRooms={loadingRooms}
      />
      <main className="flex-1 flex flex-col overflow-hidden">
        {activeRoom ? (
          <ChatWindow
            room={activeRoom}
            currentUser={user}
            onlineUsers={onlineUsers}
          />
        ) : (
          <WelcomeScreen currentUser={user} />
        )}
      </main>
    </div>
  );
}
