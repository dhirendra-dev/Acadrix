import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import {
  BarChart3,
  Users,
  Eye,
  TrendingUp,
  Loader2,
  Clock,
  RefreshCw,
  AlertCircle,
  Calendar,
  CalendarDays,
  FolderOpen,
} from "lucide-react";
import { fetchAllSessions, fetchAllViews } from "@/lib/sessionUtils";

export default function AdminAnalytics() {
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState([]);
  const [views, setViews] = useState([]);
  const [folders, setFolders] = useState([]);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    const errors = [];
    // Fetch each source independently so one failure doesn't kill the rest
    try {
      const sess = await fetchAllSessions();
      setSessions(Array.isArray(sess) ? sess : []);
    } catch (e) {
      console.error("AdminAnalytics: sessions fetch failed", e);
      errors.push("sessions");
    }
    try {
      const vws = await fetchAllViews();
      setViews(Array.isArray(vws) ? vws : []);
    } catch (e) {
      console.error("AdminAnalytics: views fetch failed", e);
      errors.push("views");
    }
    try {
      const flds = await base44.entities.Folder.list("-created_date", 200);
      setFolders(Array.isArray(flds) ? flds : []);
    } catch (e) {
      console.error("AdminAnalytics: folders fetch failed", e);
      errors.push("folders");
    }
    if (errors.length === 3) {
      setError("Could not load analytics data. Check your connection and retry.");
    } else if (errors.length > 0) {
      setError(`Partial data — could not load: ${errors.join(", ")}`);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) {
    return (
      <div className="mb-6 flex justify-center rounded-2xl border border-slate-200 bg-white p-6">
        <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
      </div>
    );
  }

  if (error && sessions.length === 0 && views.length === 0) {
    return (
      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 text-center">
        <AlertCircle className="mx-auto h-8 w-8 text-rose-400" />
        <p className="mt-2 text-sm font-semibold text-slate-700">{error}</p>
        <button
          onClick={load}
          className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition hover:bg-primary/90"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Retry
        </button>
      </div>
    );
  }

  // --- User History Stats ---
  const totalUsers = sessions.length;
  const now = Date.now();
  const dayAgo = now - 24 * 60 * 60 * 1000;
  const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
  const activeToday = sessions.filter(
    (s) => new Date(s.last_active).getTime() > dayAgo
  ).length;
  const activeThisWeek = sessions.filter(
    (s) => new Date(s.last_active).getTime() > weekAgo
  ).length;
  const newThisWeek = sessions.filter(
    (s) => new Date(s.first_seen).getTime() > weekAgo
  ).length;

  // --- New users per day (last 7 days) ---
  const dayBuckets = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    dayBuckets.push({
      key: d.toDateString(),
      label: d.toLocaleDateString(undefined, { weekday: "short" }),
      count: 0,
    });
  }
  sessions.forEach((s) => {
    if (!s.first_seen) return;
    const d = new Date(s.first_seen);
    d.setHours(0, 0, 0, 0);
    const key = d.toDateString();
    const bucket = dayBuckets.find((b) => b.key === key);
    if (bucket) bucket.count++;
  });
  const maxDayCount = Math.max(1, ...dayBuckets.map((b) => b.count));
  const newToday = dayBuckets[dayBuckets.length - 1]?.count || 0;

  // --- Old (returning) users active per day (last 7 days) ---
  // A user counts as "old/returning" on day D if they first appeared before
  // day D started AND were active (last_active) during day D.
  const oldActiveBuckets = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    oldActiveBuckets.push({
      key: d.toDateString(),
      dayStart: d.getTime(),
      dayEnd: d.getTime() + 24 * 60 * 60 * 1000,
      label: d.toLocaleDateString(undefined, { weekday: "short" }),
      count: 0,
    });
  }
  sessions.forEach((s) => {
    if (!s.first_seen || !s.last_active) return;
    const firstSeen = new Date(s.first_seen).getTime();
    const lastActive = new Date(s.last_active).getTime();
    oldActiveBuckets.forEach((b) => {
      if (firstSeen < b.dayStart && lastActive >= b.dayStart && lastActive < b.dayEnd) {
        b.count++;
      }
    });
  });
  const maxOldActiveCount = Math.max(1, ...oldActiveBuckets.map((b) => b.count));
  const oldActiveToday = oldActiveBuckets[oldActiveBuckets.length - 1]?.count || 0;

  // --- Resources used per day (last 7 days) ---
  const viewDayBuckets = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    viewDayBuckets.push({
      key: d.toDateString(),
      label: d.toLocaleDateString(undefined, { weekday: "short" }),
      count: 0,
    });
  }
  views.forEach((v) => {
    if (!v.created_date) return;
    const d = new Date(v.created_date);
    d.setHours(0, 0, 0, 0);
    const key = d.toDateString();
    const bucket = viewDayBuckets.find((b) => b.key === key);
    if (bucket) bucket.count++;
  });
  const maxViewDayCount = Math.max(1, ...viewDayBuckets.map((b) => b.count));

  // --- Resource View Stats ---
  const totalViews = views.length;
  const uniqueViewers = new Set(views.map((v) => v.device_id)).size;

  // Most viewed resources
  const viewMap = {};
  views.forEach((v) => {
    if (!viewMap[v.resource_link_id]) {
      viewMap[v.resource_link_id] = {
        title: v.resource_title,
        type: v.resource_type,
        count: 0,
        uniqueViewers: new Set(),
      };
    }
    viewMap[v.resource_link_id].count++;
    viewMap[v.resource_link_id].uniqueViewers.add(v.device_id);
  });
  const topResources = Object.entries(viewMap)
    .map(([id, data]) => ({
      id,
      ...data,
      uniqueViewers: data.uniqueViewers.size,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const typeMeta = {
    notes: { label: "Notes", color: "bg-blue-100 text-blue-700" },
    pyq: { label: "PYQ", color: "bg-amber-100 text-amber-700" },
    dpp: { label: "DPP", color: "bg-violet-100 text-violet-700" },
    video: { label: "Video", color: "bg-rose-100 text-rose-700" },
    book: { label: "Book", color: "bg-emerald-100 text-emerald-700" },
    other: { label: "Other", color: "bg-slate-100 text-slate-700" },
  };

  // Views by resource type
  const typeBreakdown = {};
  views.forEach((v) => {
    const t = v.resource_type || "other";
    typeBreakdown[t] = (typeBreakdown[t] || 0) + 1;
  });
  const typeEntries = Object.entries(typeBreakdown)
    .sort((a, b) => b[1] - a[1]);
  const maxTypeCount = typeEntries[0]?.[1] || 1;

  // Views by folder
  const folderNameById = folders.reduce((acc, f) => {
    acc[f.id] = f.name;
    return acc;
  }, {});
  const folderBreakdown = {};
  views.forEach((v) => {
    const fid = v.folder_id || "unknown";
    folderBreakdown[fid] = (folderBreakdown[fid] || 0) + 1;
  });
  const folderEntries = Object.entries(folderBreakdown)
    .map(([fid, count]) => ({ name: folderNameById[fid] || "Unknown", count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
  const maxFolderCount = folderEntries[0]?.count || 1;

  // --- Weekly Progress (last 7 days) ---
  const weekViews = views.filter(
    (v) => v.created_date && new Date(v.created_date).getTime() > weekAgo
  ).length;
  const weekNewUsers = sessions.filter(
    (s) => s.first_seen && new Date(s.first_seen).getTime() > weekAgo
  ).length;
  const weekActiveUsers = sessions.filter(
    (s) => s.last_active && new Date(s.last_active).getTime() > weekAgo
  ).length;
  const weekUniqueResources = new Set(
    views
      .filter((v) => v.created_date && new Date(v.created_date).getTime() > weekAgo)
      .map((v) => v.resource_link_id)
  ).size;

  // --- Monthly Progress (last 30 days) ---
  const monthAgo = now - 30 * 24 * 60 * 60 * 1000;
  const monthViews = views.filter(
    (v) => v.created_date && new Date(v.created_date).getTime() > monthAgo
  ).length;
  const monthNewUsers = sessions.filter(
    (s) => s.first_seen && new Date(s.first_seen).getTime() > monthAgo
  ).length;
  const monthActiveUsers = sessions.filter(
    (s) => s.last_active && new Date(s.last_active).getTime() > monthAgo
  ).length;
  const monthUniqueResources = new Set(
    views
      .filter((v) => v.created_date && new Date(v.created_date).getTime() > monthAgo)
      .map((v) => v.resource_link_id)
  ).size;

  // --- Unique users per folder ---
  const folderUserMap = {};
  views.forEach((v) => {
    const fid = v.folder_id || "unknown";
    if (!folderUserMap[fid]) {
      folderUserMap[fid] = {
        name: folderNameById[fid] || "Unknown",
        users: new Set(),
        views: 0,
      };
    }
    folderUserMap[fid].users.add(v.device_id);
    folderUserMap[fid].views++;
  });
  const folderUserEntries = Object.entries(folderUserMap)
    .map(([fid, data]) => ({
      fid,
      name: data.name,
      users: data.users.size,
      views: data.views,
    }))
    .sort((a, b) => b.users - a.users);
  const maxFolderUsers = folderUserEntries[0]?.users || 1;

  const maxCount = topResources[0]?.count || 1;

  return (
    <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-bold text-slate-900">
          <BarChart3 className="h-4 w-4 text-indigo-600" /> Analytics
        </h2>
        <button
          onClick={load}
          disabled={loading}
          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[10px] font-semibold text-slate-600 transition hover:bg-slate-100 disabled:opacity-50"
        >
          <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {error && (sessions.length > 0 || views.length > 0) && (
        <div className="mb-4 flex items-center justify-between gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
          <span className="text-xs font-medium text-amber-700">{error}</span>
          <button
            onClick={load}
            className="inline-flex shrink-0 items-center gap-1 rounded-md bg-amber-100 px-2 py-1 text-[10px] font-semibold text-amber-700 transition hover:bg-amber-200"
          >
            <RefreshCw className="h-3 w-3" /> Retry
          </button>
        </div>
      )}

      {/* User History Cards */}
      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          icon={Users}
          label="Total Users"
          value={totalUsers}
          color="indigo"
        />
        <StatCard
          icon={TrendingUp}
          label="Active Today"
          value={activeToday}
          color="emerald"
        />
        <StatCard
          icon={Clock}
          label="Active This Week"
          value={activeThisWeek}
          color="amber"
        />
        <StatCard
          icon={Users}
          label="New This Week"
          value={newThisWeek}
          color="violet"
        />
        <StatCard
          icon={TrendingUp}
          label="New Today"
          value={newToday}
          color="cyan"
        />
        <StatCard
          icon={Users}
          label="Old Active Today"
          value={oldActiveToday}
          color="rose"
        />
      </div>

      {/* Weekly Progress */}
      <div className="mb-4 rounded-xl border border-indigo-200 bg-indigo-50 p-4">
        <h3 className="mb-3 flex items-center gap-1.5 text-xs font-bold text-indigo-700">
          <Calendar className="h-3.5 w-3.5" /> Progress This Week (last 7 days)
        </h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <MiniStat label="Resources Opened" value={weekViews} />
          <MiniStat label="New Users" value={weekNewUsers} />
          <MiniStat label="Active Users" value={weekActiveUsers} />
          <MiniStat label="Unique Resources" value={weekUniqueResources} />
        </div>
      </div>

      {/* Monthly Progress */}
      <div className="mb-4 rounded-xl border border-violet-200 bg-violet-50 p-4">
        <h3 className="mb-3 flex items-center gap-1.5 text-xs font-bold text-violet-700">
          <CalendarDays className="h-3.5 w-3.5" /> Progress This Month (last 30 days)
        </h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <MiniStat label="Resources Opened" value={monthViews} />
          <MiniStat label="New Users" value={monthNewUsers} />
          <MiniStat label="Active Users" value={monthActiveUsers} />
          <MiniStat label="Unique Resources" value={monthUniqueResources} />
        </div>
      </div>

      {/* Resources Opened Till Now — per folder */}
      <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100">
              <Eye className="h-4 w-4 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs font-bold text-emerald-700">Resources Opened Till Now</p>
              <p className="text-[10px] text-emerald-600">Total opens per folder (all-time)</p>
            </div>
          </div>
          <p className="text-2xl font-extrabold text-emerald-700">{totalViews}</p>
        </div>
        {folderUserEntries.length === 0 ? (
          <p className="py-2 text-center text-xs text-slate-400">
            No resource opens yet
          </p>
        ) : (
          <div className="space-y-1.5">
            {folderUserEntries.map((f, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="w-24 shrink-0 truncate text-[10px] font-medium text-slate-600">
                  {f.name}
                </span>
                <div className="h-3 flex-1 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full bg-emerald-500"
                    style={{ width: `${(f.views / (folderUserEntries[0]?.views || 1)) * 100}%` }}
                  />
                </div>
                <span className="w-10 shrink-0 text-right text-xs font-bold text-slate-700">
                  {f.views}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* New Users Per Day (last 7 days) */}
      <div className="mb-4">
        <h3 className="mb-2 text-xs font-bold text-slate-600">
          📅 New Users Per Day (last 7 days)
        </h3>
        <div className="flex items-end justify-between gap-1.5 rounded-xl border border-slate-100 bg-slate-50 p-3">
          {dayBuckets.map((b, i) => (
            <div key={i} className="flex flex-1 flex-col items-center gap-1">
              <span className="text-[10px] font-bold text-slate-700">{b.count}</span>
              <div className="flex h-20 w-full items-end justify-center">
                <div
                  className="w-full max-w-[26px] rounded-t bg-indigo-500 transition-all"
                  style={{ height: `${(b.count / maxDayCount) * 100}%` }}
                />
              </div>
              <span className="text-[9px] text-slate-500">{b.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Old Users Active Per Day (last 7 days) */}
      <div className="mb-4">
        <h3 className="mb-2 text-xs font-bold text-slate-600">
          🔁 Old Users Active Per Day (last 7 days)
        </h3>
        <div className="flex items-end justify-between gap-1.5 rounded-xl border border-slate-100 bg-slate-50 p-3">
          {oldActiveBuckets.map((b, i) => (
            <div key={i} className="flex flex-1 flex-col items-center gap-1">
              <span className="text-[10px] font-bold text-slate-700">{b.count}</span>
              <div className="flex h-20 w-full items-end justify-center">
                <div
                  className="w-full max-w-[26px] rounded-t bg-rose-500 transition-all"
                  style={{ height: `${(b.count / maxOldActiveCount) * 100}%` }}
                />
              </div>
              <span className="text-[9px] text-slate-500">{b.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Resource View Summary */}
      <div className="mb-4 grid grid-cols-2 gap-3">
        <StatCard
          icon={Eye}
          label="Total Resource Views"
          value={totalViews}
          color="blue"
        />
        <StatCard
          icon={Users}
          label="Users Who Viewed"
          value={uniqueViewers}
          color="rose"
        />
      </div>

      {/* Resources Used Per Day (last 7 days) */}
      <div className="mb-4">
        <h3 className="mb-2 text-xs font-bold text-slate-600">
          📖 Resources Used Per Day (last 7 days)
        </h3>
        <div className="flex items-end justify-between gap-1.5 rounded-xl border border-slate-100 bg-slate-50 p-3">
          {viewDayBuckets.map((b, i) => (
            <div key={i} className="flex flex-1 flex-col items-center gap-1">
              <span className="text-[10px] font-bold text-slate-700">{b.count}</span>
              <div className="flex h-20 w-full items-end justify-center">
                <div
                  className="w-full max-w-[26px] rounded-t bg-emerald-500 transition-all"
                  style={{ height: `${(b.count / maxViewDayCount) * 100}%` }}
                />
              </div>
              <span className="text-[9px] text-slate-500">{b.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Views by Type */}
      <div className="mb-4">
        <h3 className="mb-2 text-xs font-bold text-slate-600">
          📊 Views by Resource Type
        </h3>
        {typeEntries.length === 0 ? (
          <p className="py-3 text-center text-xs text-slate-400">
            No views yet
          </p>
        ) : (
          <div className="space-y-1.5">
            {typeEntries.map(([type, count]) => {
              const meta = typeMeta[type] || typeMeta.other;
              return (
                <div key={type} className="flex items-center gap-2">
                  <span className={`w-16 shrink-0 rounded-full px-1.5 py-0.5 text-center text-[8px] font-bold ${meta.color}`}>
                    {meta.label}
                  </span>
                  <div className="h-3 flex-1 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full rounded-full bg-indigo-500"
                      style={{ width: `${(count / maxTypeCount) * 100}%` }}
                    />
                  </div>
                  <span className="w-8 shrink-0 text-right text-xs font-bold text-slate-700">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Users Per Folder */}
      <div className="mb-4">
        <h3 className="mb-2 flex items-center gap-1.5 text-xs font-bold text-slate-600">
          <FolderOpen className="h-3.5 w-3.5 text-cyan-600" /> Users Per Folder
        </h3>
        {folderUserEntries.length === 0 ? (
          <p className="py-3 text-center text-xs text-slate-400">
            No folder usage yet
          </p>
        ) : (
          <div className="space-y-1.5">
            {folderUserEntries.map((f, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="w-24 shrink-0 truncate text-[10px] font-medium text-slate-600">
                  {f.name}
                </span>
                <div className="h-3 flex-1 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full bg-cyan-500"
                    style={{ width: `${(f.users / maxFolderUsers) * 100}%` }}
                  />
                </div>
                <span className="w-14 shrink-0 text-right text-xs font-bold text-slate-700">
                  {f.users} user{f.users !== 1 ? "s" : ""}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Views by Folder */}
      <div className="mb-4">
        <h3 className="mb-2 text-xs font-bold text-slate-600">
          📁 Most Read Folders
        </h3>
        {folderEntries.length === 0 ? (
          <p className="py-3 text-center text-xs text-slate-400">
            No views yet
          </p>
        ) : (
          <div className="space-y-1.5">
            {folderEntries.map((f, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="w-24 shrink-0 truncate text-[10px] font-medium text-slate-600">
                  {f.name}
                </span>
                <div className="h-3 flex-1 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full bg-violet-500"
                    style={{ width: `${(f.count / maxFolderCount) * 100}%` }}
                  />
                </div>
                <span className="w-8 shrink-0 text-right text-xs font-bold text-slate-700">
                  {f.count}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Most Viewed Resources */}
      <div className="mb-4">
        <h3 className="mb-2 text-xs font-bold text-slate-600">
          🔥 Most Viewed Resources
        </h3>
        {topResources.length === 0 ? (
          <p className="py-3 text-center text-xs text-slate-400">
            No resource views yet
          </p>
        ) : (
          <div className="space-y-2">
            {topResources.map((r, i) => {
              const meta = typeMeta[r.type] || typeMeta.other;
              return (
                <div
                  key={r.id}
                  className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50 p-2.5"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-200 text-[10px] font-bold text-slate-600">
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold text-slate-800">
                      {r.title}
                    </p>
                    <div className="mt-0.5 flex items-center gap-2">
                      <span className={`rounded-full px-1.5 py-0.5 text-[8px] font-bold ${meta.color}`}>
                        {meta.label}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {r.uniqueViewers} user{r.uniqueViewers !== 1 ? "s" : ""}
                      </span>
                    </div>
                    <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                      <div
                        className="h-full rounded-full bg-indigo-500"
                        style={{ width: `${(r.count / maxCount) * 100}%` }}
                      />
                    </div>
                  </div>
                  <span className="shrink-0 text-sm font-bold text-slate-700">
                    {r.count}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}

function MiniStat({ label, value }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-2.5 text-center">
      <p className="text-lg font-extrabold text-slate-800">{value}</p>
      <p className="text-[10px] font-medium text-slate-500">{label}</p>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  const colors = {
    indigo: "bg-indigo-50 text-indigo-600 border-indigo-200",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-200",
    amber: "bg-amber-50 text-amber-600 border-amber-200",
    violet: "bg-violet-50 text-violet-600 border-violet-200",
    blue: "bg-blue-50 text-blue-600 border-blue-200",
    rose: "bg-rose-50 text-rose-600 border-rose-200",
    cyan: "bg-cyan-50 text-cyan-600 border-cyan-200",
  };
  return (
    <div className={`rounded-xl border p-3 ${colors[color] || colors.indigo}`}>
      <Icon className="h-4 w-4" />
      <p className="mt-1.5 text-xl font-bold text-slate-800">{value}</p>
      <p className="text-[10px] font-medium text-slate-500">{label}</p>
    </div>
  );
}