import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Users, Plus, LogIn, Copy, Check } from "lucide-react";
import { toast } from "sonner";

export default function GroupList({ deviceId, userName, onSelect }) {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [copiedId, setCopiedId] = useState(null);

  const loadGroups = async () => {
    try {
      const memberships = await base44.entities.GroupMember.filter(
        { device_id: deviceId },
        "-created_date",
        100
      );
      const groupDetails = await Promise.all(
        memberships.map((m) => base44.entities.ChatGroup.get(m.group_id))
      );
      setGroups(groupDetails.filter(Boolean));
    } catch (e) {
      /* ignore */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGroups();
  }, [deviceId]);

  const handleCreate = async () => {
    if (!groupName.trim()) return;
    const code = Math.random().toString(36).slice(2, 8).toUpperCase();
    try {
      const group = await base44.entities.ChatGroup.create({
        name: groupName.trim(),
        creator_device_id: deviceId,
        creator_name: userName,
        join_code: code,
      });
      await base44.entities.GroupMember.create({
        group_id: group.id,
        device_id: deviceId,
        member_name: userName,
      });
      setGroupName("");
      setShowCreate(false);
      toast.success(`Group created! Code: ${code}`);
      loadGroups();
    } catch (e) {
      toast.error("Could not create group");
    }
  };

  const handleJoin = async () => {
    if (!joinCode.trim()) return;
    try {
      const found = await base44.entities.ChatGroup.filter(
        { join_code: joinCode.trim().toUpperCase() },
        "-created_date",
        1
      );
      if (!found || found.length === 0) {
        toast.error("Invalid join code");
        return;
      }
      const group = found[0];
      const existing = await base44.entities.GroupMember.filter(
        { group_id: group.id, device_id: deviceId },
        "-created_date",
        1
      );
      if (!existing || existing.length === 0) {
        await base44.entities.GroupMember.create({
          group_id: group.id,
          device_id: deviceId,
          member_name: userName,
        });
      }
      setJoinCode("");
      setShowJoin(false);
      toast.success(`Joined "${group.name}"`);
      loadGroups();
    } catch (e) {
      toast.error("Could not join group");
    }
  };

  const copyCode = (code, id) => {
    navigator.clipboard?.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (loading) {
    return (
      <div className="space-y-2 p-4">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="h-16 animate-pulse rounded-xl bg-slate-200" />
        ))}
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-3">
      <div className="mb-3 flex gap-2">
        <button
          onClick={() => {
            setShowCreate(!showCreate);
            setShowJoin(false);
          }}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-3 py-2.5 text-sm font-medium text-white"
        >
          <Plus className="h-4 w-4" /> Create
        </button>
        <button
          onClick={() => {
            setShowJoin(!showJoin);
            setShowCreate(false);
          }}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700"
        >
          <LogIn className="h-4 w-4" /> Join
        </button>
      </div>

      {showCreate && (
        <div className="mb-3 rounded-xl border border-slate-200 bg-white p-3">
          <input
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            placeholder="Group name"
            className="mb-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
          />
          <button
            onClick={handleCreate}
            className="w-full rounded-lg bg-indigo-600 py-2 text-sm font-medium text-white"
          >
            Create Group
          </button>
        </div>
      )}

      {showJoin && (
        <div className="mb-3 rounded-xl border border-slate-200 bg-white p-3">
          <input
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleJoin()}
            placeholder="Enter join code"
            className="mb-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm uppercase outline-none focus:border-indigo-400"
          />
          <button
            onClick={handleJoin}
            className="w-full rounded-lg bg-indigo-600 py-2 text-sm font-medium text-white"
          >
            Join Group
          </button>
        </div>
      )}

      {groups.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Users className="h-10 w-10 text-slate-300" />
          <p className="mt-3 font-medium text-slate-600">No groups yet</p>
          <p className="text-sm text-slate-400">
            Create a group or join with a code
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {groups.map((g) => (
            <div
              key={g.id}
              className="rounded-xl border border-slate-200 bg-white p-3"
            >
              <button
                onClick={() =>
                  onSelect({
                    roomId: `group_${g.id}`,
                    chatType: "group",
                    title: g.name,
                  })
                }
                className="flex w-full items-center gap-3 text-left"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-100 text-purple-600">
                  <Users className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-800">
                    {g.name}
                  </p>
                  <p className="truncate text-xs text-slate-500">
                    Created by {g.creator_name}
                  </p>
                </div>
              </button>
              {g.creator_device_id === deviceId && (
                <button
                  onClick={() => copyCode(g.join_code, g.id)}
                  className="mt-2 flex items-center gap-1.5 rounded-lg bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-600"
                >
                  {copiedId === g.id ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-600" /> Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" /> Code: {g.join_code}
                    </>
                  )}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}