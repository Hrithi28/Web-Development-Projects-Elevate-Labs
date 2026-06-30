// Avatar.js
import React from 'react';

const sizeMap = {
  xs: 'w-7 h-7 text-xs',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-lg',
};

const colors = [
  'from-blue-500 to-indigo-600',
  'from-purple-500 to-pink-600',
  'from-green-500 to-teal-600',
  'from-orange-500 to-red-600',
  'from-yellow-500 to-orange-600',
  'from-cyan-500 to-blue-600',
];

export default function Avatar({ user, size = 'md' }) {
  if (!user) return null;
  const colorIndex = user.username?.charCodeAt(0) % colors.length || 0;
  const initial = (user.username || '?').charAt(0).toUpperCase();
  const cls = sizeMap[size] || sizeMap.md;

  if (user.avatar) {
    return (
      <img
        src={user.avatar}
        alt={user.username}
        className={`${cls} rounded-full object-cover flex-shrink-0`}
      />
    );
  }

  return (
    <div className={`${cls} rounded-full bg-gradient-to-br ${colors[colorIndex]} flex items-center justify-center text-white font-semibold flex-shrink-0`}>
      {initial}
    </div>
  );
}
