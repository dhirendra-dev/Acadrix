import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Trash2, Loader2 } from "lucide-react";

export default function AdminDeletions() {
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await base44.entities.DeletionLog.list("-created_date", 200);
        setLogs(Array.isArray(data) ? data : []);
      } catch {
        /* ignore */
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="mb-6 flex justify-center rounded-2xl border border-slate-200 bg-white p-6">
        <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4">
      <h2 className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-900">
        <Trash2 className="h-4 w-4 text-rose-500" /> App Deletions
      </h2>

      <div className="mb-4 grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-rose-100 bg-rose-50 p-3">
          <p className="text-xl font-bold text-slate-800">{logs.length}</p>
          <p className="text-[10px] font-medium text-slate-500">Total Deletions</p>
        </div>
      </div>

      {logs.length === 0 ? (
        <p className="py-4 text-center text-xs text-slate-400">
          No account deletions recorded yet
        </p>
      ) : (
        <div className="space-y-2">
          {logs.slice(0, 10).map((log) => (
            <div
              key={log.id}
              className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50 p-2.5"
            >
              <Trash2 className="h-3.5 w-3.5 shrink-0 text-rose-400" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-slate-800">
                  {log.user_email || "Anonymous user"}
                </p>
                {log.reason && (
                  <p className="truncate text-[10px] text-slate-500">
                    {log.reason}
                  </p>
                )}
              </div>
              <span className="shrink-0 text-[10px] text-slate-400">
                {log.created_date
                  ? new Date(log.created_date).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
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