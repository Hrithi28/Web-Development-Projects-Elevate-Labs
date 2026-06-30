import React, { useState, useEffect } from 'react';
import api from '../utils/api';

export default function DiscoverRoomsModal({ onClose, onJoined, currentUser }) {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(null);

  useEffect(() => {
    api.get('/rooms/public')
      .then(res => setRooms(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleJoin = async (room) => {
    setJoining(room._id);
    try {
      const res = await api.post(`/rooms/${room._id}/join`);
      onJoined(res.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to join room');
    } finally {
      setJoining(null);
    }
  };

  const isMember = (room) => room.members.some(m => m._id === currentUser._id);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-dark-800 rounded-2xl w-full max-w-md shadow-2xl border border-slate-700">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-700">
          <h2 className="text-lg font-semibold text-white">🔍 Discover Rooms</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : rooms.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <p>No public rooms yet.</p>
              <p className="text-sm mt-1 text-slate-600">Create one and invite others!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {rooms.map(room => (
                <div key={room._id} className="flex items-center gap-4 p-4 bg-dark-700 rounded-xl border border-slate-700 hover:border-slate-600 transition">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                    {room.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white text-sm truncate">{room.name}</p>
                    <p className="text-xs text-slate-400 truncate">{room.description || 'No description'}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{room.members.length} member{room.members.length !== 1 ? 's' : ''}</p>
                  </div>
                  {isMember(room) ? (
                    <span className="text-xs text-green-400 font-medium px-3 py-1.5 bg-green-500/10 rounded-lg">Joined</span>
                  ) : (
                    <button
                      onClick={() => handleJoin(room)}
                      disabled={joining === room._id}
                      className="text-xs text-white font-medium px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg transition"
                    >
                      {joining === room._id ? '...' : 'Join'}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
