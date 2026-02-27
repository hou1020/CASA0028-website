import React from 'react';

function StatCard({ title, value, textColor, borderColor }) {
  return (
    <article className={`flex flex-col gap-1 rounded-xl border ${borderColor} bg-gray-800 p-4 shadow-sm transition-transform hover:-translate-y-1`}>
      <span className="text-xs text-gray-400 font-medium">{title}</span>
      <strong className={`text-2xl font-black ${textColor}`}>
        {value.toLocaleString()}
      </strong>
    </article>
  );
}

export default StatCard;