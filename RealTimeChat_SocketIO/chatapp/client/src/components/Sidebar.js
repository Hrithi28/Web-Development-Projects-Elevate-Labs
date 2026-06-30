import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import CreateRoomModal from './CreateRoomModal';
import DiscoverRoomsModal from './DiscoverRoomsModal';
import Avatar from './Avatar';
import { formatDistanceToNow } from 'date-fns';

export default function Sidebar({
  rooms, activeRoom, onSelectRoom, onRoomCreated, onRoomJoined,
  onlineUsers, currentUser, loadingRooms
}) {
  const { logout } = useAuth();
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [showDiscover, setShowDiscover] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const filtered = rooms.filter(r => {
    const name = r.type === 'dm'
      ? r.members.find(m => m._id !== currentUser._id)?.username || r.name
      : r.name;
    return name.toLowerCase().includes(search.toLowerCase());
  });

  const getRoomDisplayName = (room) => {
    if (room.type === 'dm') {
      const other = room.members.find(m => m._id !== currentUser._id);
      return other?.username || 'Direct Message';
    }
    return room.name;
  };

  const getRoomAvatar = (room) => {
    if (room.type === 'dm') {
      return room.members.find(m => m._id !== currentUser._id);
    }
    return null;
  };

  const isRoomOnline = (room) => {
    if (room.type === 'dm') {
      const other = room.members.find(m => m._id !== currentUser._id);
      return other && onlineUsers.has(other._id);
    }
    return false;
  };

  return (
    <>
      <aside className="w-72 bg-dark-800 border-r border-slate-700 flex flex-col h-full">
        {/* Header */}
        <div className="px-4 py-4 border-b border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <span className="font-bold text-white text-lg">ChatApp</span>
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => setShowCreate(true)}
                title="Create Room"
                className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
              <button
                onClick={() => setShowDiscover(true)}
                title="Discover Rooms"
                className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search chats..."
              className="w-full pl-9 pr-4 py-2.5 bg-dark-700 border border-slate-600 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Room List */}
        <div className="flex-1 overflow-y-auto py-2">
          {loadingRooms ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 px-4">
              <div className="w-12 h-12 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <p className="text-slate-400 text-sm font-medium">No chats yet</p>
              <p className="text-slate-600 text-xs mt-1">Create or discover a room</p>
            </div>
          ) : (
            filtered.map(room => {
              const displayName = getRoomDisplayName(room);
              const dmUser = getRoomAvatar(room);
              const isOnline = isRoomOnline(room);
              const isActive = activeRoom?._id === room._id;

              return (
                <button
                  key={room._id}
                  onClick={() => onSelectRoom(room)}
                  className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-dark-700 transition text-left ${isActive ? 'bg-blue-600/10 border-r-2 border-blue-500' : ''}`}
                >
                  <div className="relative flex-shrink-0">
                    {dmUser ? (
                      <Avatar user={dmUser} size="md" />
                    ) : (
                      <div className="w-11 h-11 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                        {displayName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    {isOnline && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-dark-800 online-pulse"></span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <span className={`font-medium text-sm truncate ${isActive ? 'text-blue-300' : 'text-white'}`}>
                        {displayName}
                      </span>
                      {room.lastMessage && (
                        <span className="text-xs text-slate-500 flex-shrink-0 ml-2">
                          {formatDistanceToNow(new Date(room.updatedAt || room.createdAt), { addSuffix: false })}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 truncate mt-0.5">
                      {room.lastMessage
                        ? (room.lastMessage.sender?.username === currentUser.username ? 'You: ' : '') + room.lastMessage.content
                        : room.type === 'group' ? `${room.members.length} members` : 'Start a conversation'}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* User Profile Footer */}
        <div className="px-4 py-3 border-t border-slate-700 flex items-center gap-3">
          <div className="relative">
            <Avatar user={currentUser} size="sm" />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-dark-800"></span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{currentUser.username}</p>
            <p className="text-xs text-green-400">Online</p>
          </div>
          <button
            onClick={logout}
            title="Sign out"
            className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-red-400 transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </aside>

      {showCreate && (
        <CreateRoomModal
          onClose={() => setShowCreate(false)}
          onCreated={(room) => { onRoomCreated(room); setShowCreate(false); }}
          currentUser={currentUser}
        />
      )}
      {showDiscover && (
        <DiscoverRoomsModal
          onClose={() => setShowDiscover(false)}
          onJoined={(room) => { onRoomJoined(room); setShowDiscover(false); }}
          currentUser={currentUser}
        />
      )}
    </>
  );
}
