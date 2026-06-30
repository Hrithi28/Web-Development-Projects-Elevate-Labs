import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSocket } from '../context/SocketContext';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import Avatar from './Avatar';
import api from '../utils/api';

export default function ChatWindow({ room, currentUser, onlineUsers }) {
  const { socket } = useSocket();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const isDM = room.type === 'dm';
  const otherUser = isDM ? room.members.find(m => m._id !== currentUser._id) : null;
  const displayName = isDM ? otherUser?.username : room.name;
  const memberCount = room.members?.length || 0;
  const isOtherOnline = isDM && otherUser && onlineUsers.has(otherUser._id);

  // Fetch messages
  const fetchMessages = useCallback(async (p = 1) => {
    try {
      setLoading(p === 1);
      const res = await api.get(`/messages/${room._id}?page=${p}&limit=50`);
      const { messages: msgs, pagination } = res.data;
      setMessages(prev => p === 1 ? msgs : [...msgs, ...prev]);
      setHasMore(pagination.total > p * pagination.limit);
      setPage(p);
    } catch (err) {
      console.error('Failed to fetch messages:', err);
    } finally {
      setLoading(false);
    }
  }, [room._id]);

  useEffect(() => {
    setMessages([]);
    setPage(1);
    setTypingUsers([]);
    fetchMessages(1);
    inputRef.current?.focus();
  }, [room._id, fetchMessages]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (!loading) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading]);

  // Socket events
  useEffect(() => {
    if (!socket) return;

    const onNewMessage = (message) => {
      if (message.room === room._id) {
        setMessages(prev => [...prev, message]);
        // Mark as read
        socket.emit('message:read', { roomId: room._id });
      }
    };

    const onTyping = ({ userId, username, roomId, isTyping }) => {
      if (roomId !== room._id || userId === currentUser._id) return;
      setTypingUsers(prev =>
        isTyping
          ? prev.includes(username) ? prev : [...prev, username]
          : prev.filter(u => u !== username)
      );
    };

    socket.on('message:new', onNewMessage);
    socket.on('typing:update', onTyping);

    // Mark as read on focus
    socket.emit('message:read', { roomId: room._id });

    return () => {
      socket.off('message:new', onNewMessage);
      socket.off('typing:update', onTyping);
    };
  }, [socket, room._id, currentUser._id]);

  const handleSend = async (e) => {
    e?.preventDefault();
    const content = input.trim();
    if (!content || sending || !socket) return;

    setInput('');
    setSending(true);
    stopTyping();

    socket.emit('message:send', { roomId: room._id, content });
    setSending(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const startTyping = () => {
    if (!socket) return;
    socket.emit('typing:start', { roomId: room._id });
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(stopTyping, 2000);
  };

  const stopTyping = () => {
    if (!socket) return;
    socket.emit('typing:stop', { roomId: room._id });
    clearTimeout(typingTimeoutRef.current);
  };

  const handleInput = (e) => {
    setInput(e.target.value);
    if (e.target.value) startTyping();
    else stopTyping();
  };

  // Group messages by date
  const groupedMessages = messages.reduce((groups, msg) => {
    const date = new Date(msg.createdAt).toDateString();
    if (!groups[date]) groups[date] = [];
    groups[date].push(msg);
    return groups;
  }, {});

  return (
    <div className="flex flex-col h-full bg-dark-900">
      {/* Header */}
      <div className="px-6 py-4 bg-dark-800 border-b border-slate-700 flex items-center gap-4 flex-shrink-0">
        <div className="relative">
          {isDM && otherUser ? (
            <>
              <Avatar user={otherUser} size="md" />
              {isOtherOnline && (
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-dark-800"></span>
              )}
            </>
          ) : (
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
              {displayName?.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div className="flex-1">
          <h2 className="font-semibold text-white">{displayName}</h2>
          <p className="text-xs text-slate-400">
            {isDM
              ? isOtherOnline ? '🟢 Online' : '⚫ Offline'
              : `${memberCount} member${memberCount !== 1 ? 's' : ''}`
            }
          </p>
        </div>
        {!isDM && (
          <div className="flex items-center gap-2 text-slate-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-sm">{memberCount}</span>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 messages-container">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            {hasMore && (
              <button
                onClick={() => fetchMessages(page + 1)}
                className="w-full py-2 text-sm text-blue-400 hover:text-blue-300 text-center mb-4"
              >
                Load older messages
              </button>
            )}

            {Object.entries(groupedMessages).map(([date, msgs]) => (
              <div key={date}>
                {/* Date divider */}
                <div className="flex items-center gap-4 my-4">
                  <div className="flex-1 h-px bg-slate-700"></div>
                  <span className="text-xs text-slate-500 bg-dark-900 px-3 py-1 rounded-full border border-slate-700">
                    {date === new Date().toDateString() ? 'Today' :
                      date === new Date(Date.now() - 86400000).toDateString() ? 'Yesterday' : date}
                  </span>
                  <div className="flex-1 h-px bg-slate-700"></div>
                </div>

                {msgs.map((msg, i) => (
                  <MessageBubble
                    key={msg._id}
                    message={msg}
                    isOwn={msg.sender?._id === currentUser._id || msg.sender === currentUser._id}
                    showAvatar={
                      i === 0 ||
                      msgs[i - 1]?.sender?._id !== msg.sender?._id
                    }
                  />
                ))}
              </div>
            ))}

            {messages.length === 0 && !loading && (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <p className="text-slate-400 font-medium">No messages yet</p>
                <p className="text-slate-600 text-sm mt-1">Send the first message!</p>
              </div>
            )}

            {typingUsers.length > 0 && <TypingIndicator users={typingUsers} />}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <div className="px-6 py-4 bg-dark-800 border-t border-slate-700 flex-shrink-0">
        <form onSubmit={handleSend} className="flex items-center gap-3">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              placeholder={`Message ${displayName}...`}
              rows={1}
              className="w-full px-4 py-3 pr-12 bg-dark-700 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm transition"
              style={{ maxHeight: '120px' }}
            />
          </div>
          <button
            type="submit"
            disabled={!input.trim() || sending}
            className="flex-shrink-0 w-11 h-11 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl flex items-center justify-center transition"
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </form>
        <p className="text-xs text-slate-600 mt-2 text-center">Enter to send · Shift+Enter for new line</p>
      </div>
    </div>
  );
}
