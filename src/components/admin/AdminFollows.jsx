import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Users, Loader2, Youtube, MessageCircle } from "lucide-react";

export default function AdminFollows() {
  const [loading, setLoading] = useState(true);
  const [follows, setFollows] = useState([]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await base44.entities.ChannelFollow.list("-created_date", 2000);
        setFollows(Array.isArray(data) ? data : []);
      } catch {
        /* ignore */
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="mb-6 flex justify-center rounded-2xl border border-slate-200 bg-white p-6">
        <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
      </div>
    );
  }

  const total = follows.length;
  const dayAgo = Date.now() - 24 * 60 * 60 * 1000;
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const today = follows.filter(
    (f) => new Date(f.created_date).getTime() > dayAgo
  ).length;
  const thisWeek = follows.filter(
    (f) => new Date(f.created_date).getTime() > weekAgo
  ).length;

  return (
    <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4">
      <h2 className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-900">
        <Users className="h-4 w-4 text-indigo-600" /> Channel Follows
      </h2>

      <div className="mb-4 grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-3">
          <p className="text-xl font-bold text-slate-800">{total}</p>
          <p className="text-[10px] font-medium text-slate-500">Total</p>
        </div>
        <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-3">
          <p className="text-xl font-bold text-slate-800">{today}</p>
          <p className="text-[10px] font-medium text-slate-500">Today</p>
        </div>
        <div className="rounded-xl border border-purple-100 bg-purple-50 p-3">
          <p className="text-xl font-bold text-slate-800">{thisWeek}</p>
          <p className="text-[10px] font-medium text-slate-500">This Week</p>
        </div>
      </div>

      <div className="mb-3 flex items-center gap-3 rounded-lg bg-slate-50 p-2.5">
        <Youtube className="h-4 w-4 text-red-600" />
        <MessageCircle className="h-4 w-4 text-green-600" />
        <span className="text-[10px] text-slate-500">
          Each record = a user who confirmed following both channels
        </span>
      </div>

      {total === 0 ? (
        <p className="py-3 text-center text-xs text-slate-400">
          No follow records yet
        </p>
      ) : (
        <div className="space-y-2">
          {follows.map((f) => (
            <div
              key={f.id}
              className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50 p-2.5"
            >
              <Users className="h-3.5 w-3.5 shrink-0 text-slate-400" />
              <p className="min-w-0 flex-1 truncate text-xs font-medium text-slate-700">
                {f.device_id || "Anonymous"}
              </p>
              <span className="shrink-0 text-[10px] text-slate-400">
                {f.created_date
                  ? new Date(f.created_date).toLocaleString("en-IN", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : ""}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}