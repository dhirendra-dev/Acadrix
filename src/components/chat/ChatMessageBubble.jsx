import React from "react";

const COLORS = [
  "text-indigo-600",
  "text-emerald-600",
  "text-purple-600",
  "text-rose-600",
  "text-amber-600",
  "text-cyan-600",
  "text-blue-600",
  "text-pink-600",
];

function getColorForId(id) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return COLORS[Math.abs(hash) % COLORS.length];
}

export default function ChatMessageBubble({ message, isOwn, onUserClick }) {
  const color = getColorForId(message.sender_device_id);
  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[75%] rounded-2xl px-3.5 py-2 ${
          isOwn
            ? "bg-indigo-600 text-white"
            : "border border-slate-200 bg-white text-slate-800"
        }`}
      >
        {!isOwn && (
          <button
            onClick={() =>
              onUserClick && onUserClick(message.sender_device_id, message.sender_name)
            }
            className={`mb-0.5 text-xs font-semibold ${color} ${
              onUserClick ? "cursor-pointer hover:underline" : "cursor-default"
            }`}
          >
            {message.sender_name}
          </button>
        )}
        <p className="whitespace-pre-wrap break-words text-sm">{message.content}</p>
        <p
          className={`mt-0.5 text-[10px] ${
            isOwn ? "text-indigo-200" : "text-slate-400"
          }`}
        >
          {new Date(message.created_date).toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
    </div>
  );
}