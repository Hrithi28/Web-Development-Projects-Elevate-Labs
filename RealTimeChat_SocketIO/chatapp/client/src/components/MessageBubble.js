import React, { useState } from 'react';
import Avatar from './Avatar';
import { format } from 'date-fns';
import api from '../utils/api';

export default function MessageBubble({ message, isOwn, showAvatar }) {
  const [hovered, setHovered] = useState(false);
  const [deleted, setDeleted] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm('Delete this message?')) return;
    try {
      await api.delete(`/messages/${message._id}`);
      setDeleted(true);
    } catch (err) {
      alert('Failed to delete message');
    }
  };

  const timeStr = message.createdAt
    ? format(new Date(message.createdAt), 'h:mm a')
    : '';

  if (deleted) {
    return (
      <div className={`flex items-end gap-2 mb-1 ${isOwn ? 'flex-row-reverse' : ''}`}>
        <div className="w-8" />
        <p className="text-xs text-slate-600 italic px-2">Message deleted</p>
      </div>
    );
  }

  return (
    <div
      className={`flex items-end gap-2 mb-1 message-enter group ${isOwn ? 'flex-row-reverse' : ''}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Avatar */}
      <div className="w-8 flex-shrink-0 mb-1">
        {showAvatar && !isOwn && message.sender && (
          <Avatar user={message.sender} size="xs" />
        )}
      </div>

      {/* Bubble */}
      <div className={`max-w-[70%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col`}>
        {showAvatar && !isOwn && (
          <span className="text-xs text-slate-400 mb-1 ml-1">{message.sender?.username}</span>
        )}
        <div
          className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed relative ${
            isOwn
              ? 'bg-blue-600 text-white rounded-br-sm'
              : 'bg-dark-700 text-slate-100 rounded-bl-sm border border-slate-700'
          }`}
        >
          <p className="whitespace-pre-wrap break-words">{message.content}</p>
          <div className={`flex items-center gap-1 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
            <span className={`text-xs ${isOwn ? 'text-blue-200' : 'text-slate-500'}`}>{timeStr}</span>
            {message.edited && <span className={`text-xs ${isOwn ? 'text-blue-300' : 'text-slate-500'}`}>(edited)</span>}
          </div>
        </div>
      </div>

      {/* Actions on hover */}
      {isOwn && hovered && (
        <button
          onClick={handleDelete}
          className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/20 rounded-lg text-slate-500 hover:text-red-400 transition flex-shrink-0"
          title="Delete message"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      )}
    </div>
  );
}
