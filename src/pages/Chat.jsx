import React, { useState } from "react";
import { MessageCircle, Users, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ChatRoom from "@/components/chat/ChatRoom";
import DirectChatList from "@/components/chat/DirectChatList";
import GroupList from "@/components/chat/GroupList";

const DEVICE_KEY = "dreamiit_device_id";
const NAME_KEY = "dreamiit_chat_name";

function getDeviceId() {
  let id = localStorage.getItem(DEVICE_KEY);
  if (!id) {
    id =
      "dev_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    localStorage.setItem(DEVICE_KEY, id);
  }
  return id;
}

export default function Chat() {
  const deviceId = getDeviceId();
  const [userName, setUserName] = useState(
    localStorage.getItem(NAME_KEY) || ""
  );
  const [nameInput, setNameInput] = useState("");
  const [tab, setTab] = useState("common");
  const [activeRoom, setActiveRoom] = useState(null);

  const handleSetName = () => {
    if (!nameInput.trim()) return;
    const name = nameInput.trim();
    localStorage.setItem(NAME_KEY, name);
    setUserName(name);
  };

  const startDirectChat = (otherDeviceId, otherName) => {
    const roomId = `personal_${[deviceId, otherDeviceId].sort().join("_")}`;
    setActiveRoom({
      roomId,
      chatType: "personal",
      title: otherName,
      recipientDeviceId: otherDeviceId,
      recipientName: otherName,
    });
  };

  if (!userName) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-white">
            <MessageCircle className="h-7 w-7" />
          </div>
          <h1 className="mb-1 text-lg font-bold text-slate-900">Join the Chat</h1>
          <p className="mb-4 text-sm text-slate-500">
            Enter a display name to start
          </p>
          <Input
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSetName()}
            placeholder="Your display name"
            className="mb-3"
            maxLength={20}
          />
          <Button onClick={handleSetName} className="w-full">
            Start Chatting
          </Button>
        </div>
      </div>
    );
  }

  if (activeRoom) {
    return (
      <div className="h-[calc(100vh-6rem)]">
        <ChatRoom
          roomId={activeRoom.roomId}
          chatType={activeRoom.chatType}
          title={activeRoom.title}
          currentUser={userName}
          deviceId={deviceId}
          onBack={() => setActiveRoom(null)}
          recipientDeviceId={activeRoom.recipientDeviceId}
          recipientName={activeRoom.recipientName}
        />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-6rem)] flex-col">
      <header className="shrink-0 border-b border-slate-200 bg-white px-4 py-3">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-indigo-600" />
          <h1 className="text-lg font-bold text-slate-900">Community Chat</h1>
        </div>
        <div className="mt-2 flex gap-2">
          <TabButton
            active={tab === "common"}
            onClick={() => setTab("common")}
            icon={MessageCircle}
            label="Common"
          />
          <TabButton
            active={tab === "direct"}
            onClick={() => setTab("direct")}
            icon={UserPlus}
            label="Direct"
          />
          <TabButton
            active={tab === "groups"}
            onClick={() => setTab("groups")}
            icon={Users}
            label="Groups"
          />
        </div>
      </header>
      <div className="flex-1 overflow-hidden">
        {tab === "common" && (
          <ChatRoom
            roomId="common"
            chatType="common"
            title="Common Chat"
            currentUser={userName}
            deviceId={deviceId}
            onUserClick={startDirectChat}
          />
        )}
        {tab === "direct" && (
          <DirectChatList deviceId={deviceId} onSelect={setActiveRoom} />
        )}
        {tab === "groups" && (
          <GroupList
            deviceId={deviceId}
            userName={userName}
            onSelect={setActiveRoom}
          />
        )}
      </div>
    </div>
  );
}

function TabButton({ active, onClick, icon: Icon, label }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition ${
        active ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600"
      }`}
    >
      <Icon className="h-4 w-4" /> {label}
    </button>
  );
}