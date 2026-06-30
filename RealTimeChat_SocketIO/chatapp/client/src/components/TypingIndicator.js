import React from 'react';

export default function TypingIndicator({ users }) {
  if (!users || users.length === 0) return null;

  const label = users.length === 1
    ? `${users[0]} is typing`
    : users.length === 2
      ? `${users[0]} and ${users[1]} are typing`
      : 'Several people are typing';

  return (
    <div className="flex items-center gap-2 mb-2 px-1">
      <div className="flex items-center gap-1 bg-dark-700 border border-slate-700 rounded-2xl rounded-bl-sm px-4 py-2.5">
        <span className="w-2 h-2 bg-slate-400 rounded-full typing-dot"></span>
        <span className="w-2 h-2 bg-slate-400 rounded-full typing-dot"></span>
        <span className="w-2 h-2 bg-slate-400 rounded-full typing-dot"></span>
      </div>
      <span className="text-xs text-slate-500">{label}...</span>
    </div>
  );
}
