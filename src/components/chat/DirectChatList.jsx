import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { MessageCircle } from "lucide-react";

export default function DirectChatList({ deviceId, onSelect }) {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadConversations = async () => {
    try {
      const [sent, received] = await Promise.all([
        base44.entities.ChatMessage.filter(
          { chat_type: "personal", sender_device_id: deviceId },
          "-created_date",
          200
        ),
        base44.entities.ChatMessage.filter(
          { chat_type: "personal", recipient_device_id: deviceId },
          "-created_date",
          200
        ),
      ]);

      const map = {};
      [...sent, ...received].forEach((m) => {
        const existing = map[m.room_id];
        if (!existing || new Date(m.created_date) > new Date(existing.created_date)) {
          const isSender = m.sender_device_id === deviceId;
          map[m.room_id] = {
            roomId: m.room_id,
            otherName: isSender ? m.recipient_name || "Unknown" : m.sender_name,
            otherDeviceId: isSender ? m.recipient_device_id : m.sender_device_id,
            lastMessage: m.content,
            created_date: m.created_date,
          };
        }
      });

      setConversations(
        Object.values(map).sort(
          (a, b) => new Date(b.created_date) - new Date(a.created_date)
        )
      );
    } catch (e) {
      /* ignore */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConversations();
    const interval = setInterval(loadConversations, 10000);
    return () => clearInterval(interval);
  }, [deviceId]);

  if (loading) {
    return (
      <div className="space-y-2 p-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-16 animate-pulse rounded-xl bg-slate-200" />
        ))}
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-8 text-center">
        <MessageCircle className="h-10 w-10 text-slate-300" />
        <p className="mt-3 font-medium text-slate-600">No direct messages</p>
        <p className="text-sm text-slate-400">
          Go to Common Chat and tap someone's name to start a private conversation
        </p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-3">
      <div className="space-y-2">
        {conversations.map((c) => (
          <button
            key={c.roomId}
            onClick={() =>
              onSelect({
                roomId: c.roomId,
                chatType: "personal",
                title: c.otherName,
                recipientDeviceId: c.otherDeviceId,
                recipientName: c.otherName,
              })
            }
            className="flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 text-left transition hover:bg-slate-50"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-600">
              {c.otherName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-800">
                {c.otherName}
              </p>
              <p className="truncate text-xs text-slate-500">{c.lastMessage}</p>
            </div>
            <span className="shrink-0 text-[10px] text-slate-400">
              {new Date(c.created_date).toLocaleTimeString("en-IN", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}