import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import {
  Loader2,
  CheckCircle2,
  Clock,
  MapPin,
  MessageSquare,
  RefreshCw,
} from "lucide-react";

export default function MyRequests({ deviceKey = "dreamiit_device_id" }) {
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState([]);

  const load = async () => {
    const did = localStorage.getItem(deviceKey);
    if (!did) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await base44.entities.ResourceRequest.filter(
        { device_id: did },
        "-created_date",
        50
      );
      setRequests(Array.isArray(data) ? data : []);
    } catch (e) {
      /* ignore */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-4">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (requests.length === 0) {
    return null;
  }

  return (
    <div className="border-t border-border pt-3">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-xs font-bold text-muted-foreground">My Requests</h3>
        <button
          onClick={load}
          className="text-muted-foreground hover:text-foreground"
        >
          <RefreshCw className="h-3 w-3" />
        </button>
      </div>
      <div className="max-h-48 space-y-1.5 overflow-y-auto">
        {requests.map((r) => (
          <div
            key={r.id}
            className="rounded-lg border border-border bg-secondary/50 px-3 py-2"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="min-w-0 flex-1 text-xs font-medium text-foreground">
                {r.book_name}
              </p>
              {r.status === "pending" ? (
                <span className="flex shrink-0 items-center gap-0.5 rounded-full bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold text-amber-700 dark:bg-amber-500/15 dark:text-amber-400">
                  <Clock className="h-2.5 w-2.5" /> Waiting
                </span>
              ) : (
                <span className="flex shrink-0 items-center gap-0.5 rounded-full bg-emerald-100 px-1.5 py-0.5 text-[9px] font-bold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400">
                  <CheckCircle2 className="h-2.5 w-2.5" /> Replied
                </span>
              )}
            </div>
            {r.status === "fulfilled" && r.admin_note && (
              <div className="mt-1 flex items-start gap-1 rounded-md bg-emerald-50 px-2 py-1 dark:bg-emerald-500/10">
                <MapPin className="mt-0.5 h-2.5 w-2.5 shrink-0 text-emerald-500" />
                <p className="text-[10px] text-muted-foreground">{r.admin_note}</p>
              </div>
            )}
            {r.status === "already_available" && r.admin_note && (
              <div className="mt-1 flex items-start gap-1 rounded-md bg-indigo-50 px-2 py-1 dark:bg-indigo-500/10">
                <MapPin className="mt-0.5 h-2.5 w-2.5 shrink-0 text-indigo-500" />
                <p className="text-[10px] text-muted-foreground">{r.admin_note}</p>
              </div>
            )}
            {r.status === "other" && r.admin_note && (
              <div className="mt-1 flex items-start gap-1 rounded-md bg-secondary px-2 py-1">
                <MessageSquare className="mt-0.5 h-2.5 w-2.5 shrink-0 text-muted-foreground" />
                <p className="text-[10px] text-muted-foreground">{r.admin_note}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}