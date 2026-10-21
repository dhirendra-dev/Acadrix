import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, Send } from "lucide-react";
import ChatMessageBubble from "./ChatMessageBubble";

export default function ChatRoom({
  roomId,
  chatType,
  title,
  currentUser,
  deviceId,
  onBack,
  onUserClick,
  recipientDeviceId,
  recipientName,
}) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);

  const loadMessages = async () => {
    try {
      const data = await base44.entities.ChatMessage.filter(
        { room_id: roomId },
        "-created_date",
        200
      );
      setMessages(data.reverse());
    } catch (e) {
      /* ignore */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    setMessages([]);
    loadMessages();
    const unsubscribe = base44.entities.ChatMessage.subscribe((event) => {
      if (event.data?.room_id === roomId) {
        loadMessages();
      }
    });
    return unsubscribe;
  }, [roomId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    const content = input.trim();
    if (!content) return;
    setInput("");
    try {
      const msg = {
        sender_device_id: deviceId,
        sender_name: currentUser,
        content,
        chat_type: chatType,
        room_id: roomId,
      };
      if (chatType === "personal") {
        msg.recipient_device_id = recipientDeviceId;
        msg.recipient_name = recipientName;
      }
      await base44.entities.ChatMessage.create(msg);
      loadMessages();
    } catch (e) {
      setInput(content);
    }
  };

  return (
    <div className="flex h-full flex-col bg-slate-50">
      {onBack && (
        <div className="flex shrink-0 items-center gap-2 border-b border-slate-200 bg-white px-3 py-2.5">
          <button
            onClick={onBack}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-sm font-semibold text-slate-800">{title}</h1>
        </div>
      )}
      <div
        ref={scrollRef}
        className="flex-1 space-y-2 overflow-y-auto overscroll-contain px-3 py-3"
      >
        {loading ? (
          <p className="text-center text-sm text-slate-400">Loading messages...</p>
        ) : messages.length === 0 ? (
          <p className="text-center text-sm text-slate-400">
            No messages yet. Say hi! 👋
          </p>
        ) : (
          messages.map((m) => (
            <ChatMessageBubble
              key={m.id}
              message={m}
              isOwn={m.sender_device_id === deviceId}
              onUserClick={onUserClick}
            />
          ))
        )}
      </div>
      <div className="shrink-0 border-t border-slate-200 bg-white p-2.5">
        <div className="flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Type a message..."
            className="flex-1 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm outline-none focus:border-indigo-400 focus:bg-white"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white transition hover:bg-indigo-700 disabled:opacity-40"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}