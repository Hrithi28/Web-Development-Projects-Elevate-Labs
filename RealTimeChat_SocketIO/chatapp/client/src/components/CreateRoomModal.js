import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import Avatar from './Avatar';

export default function CreateRoomModal({ onClose, onCreated, currentUser }) {
  const [tab, setTab] = useState('group'); // 'group' | 'dm'
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [users, setUsers] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (userSearch.length < 1) { setUsers([]); return; }
    const t = setTimeout(async () => {
      try {
        const res = await api.get(`/users?search=${userSearch}`);
        setUsers(res.data);
      } catch { }
    }, 300);
    return () => clearTimeout(t);
  }, [userSearch]);

  const toggleUser = (u) => {
    setSelectedUsers(prev =>
      prev.find(p => p._id === u._id)
        ? prev.filter(p => p._id !== u._id)
        : [...prev, u]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (tab === 'group') {
        if (!name.trim()) { setError('Room name is required'); setLoading(false); return; }
        const res = await api.post('/rooms', {
          name: name.trim(),
          description: description.trim(),
          members: selectedUsers.map(u => u._id),
          isPrivate,
        });
        onCreated(res.data);
      } else {
        if (selectedUsers.length !== 1) { setError('Select exactly one user for DM'); setLoading(false); return; }
        // Emit DM via socket - just open DM room
        const res = await api.post('/rooms', {
          name: `dm_temp`,
          members: [selectedUsers[0]._id],
          type: 'dm',
        });
        onCreated(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create room');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-dark-800 rounded-2xl w-full max-w-md shadow-2xl border border-slate-700">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-700">
          <h2 className="text-lg font-semibold text-white">New Conversation</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-700">
          {['group', 'dm'].map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-3 text-sm font-medium transition ${tab === t ? 'text-blue-400 border-b-2 border-blue-500' : 'text-slate-400 hover:text-white'}`}
            >
              {t === 'group' ? '👥 Group Room' : '💬 Direct Message'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">{error}</div>
          )}

          {tab === 'group' && (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Room Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. general, design-team"
                  className="w-full px-4 py-2.5 bg-dark-700 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Description</label>
                <input
                  type="text"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="What's this room about?"
                  className="w-full px-4 py-2.5 bg-dark-700 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPrivate}
                  onChange={e => setIsPrivate(e.target.checked)}
                  className="w-4 h-4 rounded accent-blue-500"
                />
                <span className="text-sm text-slate-300">Private room (invite only)</span>
              </label>
            </>
          )}

          {/* User Search */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              {tab === 'group' ? 'Add Members' : 'Select User'}
            </label>
            <input
              type="text"
              value={userSearch}
              onChange={e => setUserSearch(e.target.value)}
              placeholder="Search by username..."
              className="w-full px-4 py-2.5 bg-dark-700 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            {users.length > 0 && (
              <div className="mt-2 bg-dark-700 border border-slate-600 rounded-xl overflow-hidden max-h-40 overflow-y-auto">
                {users.map(u => (
                  <button
                    key={u._id}
                    type="button"
                    onClick={() => toggleUser(u)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-600 transition text-left ${selectedUsers.find(s => s._id === u._id) ? 'bg-blue-600/20' : ''}`}
                  >
                    <Avatar user={u} size="sm" />
                    <span className="text-sm text-white">{u.username}</span>
                    {selectedUsers.find(s => s._id === u._id) && (
                      <svg className="w-4 h-4 text-blue-400 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            )}
            {selectedUsers.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedUsers.map(u => (
                  <span key={u._id} className="flex items-center gap-1.5 bg-blue-600/20 text-blue-300 text-xs px-3 py-1.5 rounded-full">
                    {u.username}
                    <button type="button" onClick={() => toggleUser(u)} className="hover:text-white">×</button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded-xl transition"
          >
            {loading ? 'Creating...' : tab === 'group' ? 'Create Room' : 'Start Chat'}
          </button>
        </form>
      </div>
    </div>
  );
}
