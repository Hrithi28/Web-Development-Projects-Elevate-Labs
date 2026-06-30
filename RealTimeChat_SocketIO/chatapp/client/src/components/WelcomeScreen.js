import React from 'react';

export default function WelcomeScreen({ currentUser }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-dark-900 text-center px-8">
      <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl flex items-center justify-center mb-6 shadow-2xl">
        <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-white mb-2">
        Welcome back, {currentUser?.username}!
      </h2>
      <p className="text-slate-400 max-w-sm leading-relaxed">
        Select a conversation from the sidebar, or create a new room to start chatting in real-time.
      </p>
      <div className="flex gap-4 mt-8 text-sm text-slate-500">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
          <span>Real-time messaging</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
          <span>Private & group chats</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
          <span>Online presence</span>
        </div>
      </div>
    </div>
  );
}
