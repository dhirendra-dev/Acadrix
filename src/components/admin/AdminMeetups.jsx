import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Video, Plus, Pencil, Trash2, CalendarClock, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";

const STATUSES = [
  { value: "auto", label: "Auto (by time)" },
  { value: "upcoming", label: "Upcoming" },
  { value: "live", label: "Live" },
  { value: "completed", label: "Completed" },
];

function toLocalInput(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const off = d.getTimezoneOffset();
  const local = new Date(d.getTime() - off * 60000);
  return local.toISOString().slice(0, 16);
}

function fromLocalInput(value) {
  return new Date(value).toISOString();
}

function statusOf(m, now = Date.now()) {
  if (m.status_override && m.status_override !== "auto") return m.status_override;
  const start = new Date(m.start_time).getTime();
  const end = new Date(m.end_time).getTime();
  if (now < start) return "upcoming";
  if (now >= start && now < end) return "live";
  return "completed";
}

export default function AdminMeetups() {
  const [meetups, setMeetups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "Online Meetup",
    meet_url: "",
    start_time: "",
    end_time: "",
    status_override: "auto",
  });

  const load = async () => {
    setLoading(true);
    try {
      const data = await base44.entities.Meetup.list("-created_date", 50);
      setMeetups(Array.isArray(data) ? data : []);
    } catch (e) {
      toast.error("Could not load meetups");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({
      title: "Online Meetup",
      meet_url: "https://meet.google.com/",
      start_time: "",
      end_time: "",
      status_override: "auto",
    });
    setFormOpen(true);
  };

  const openEdit = (m) => {
    setEditing(m);
    setForm({
      title: m.title || "Online Meetup",
      meet_url: m.meet_url || "",
      start_time: toLocalInput(m.start_time),
      end_time: toLocalInput(m.end_time),
      status_override: m.status_override || "auto",
    });
    setFormOpen(true);
  };

  const handleSave = async () => {
    if (!form.meet_url.trim() || !form.start_time || !form.end_time) {
      toast.error("URL, start and end time are required");
      return;
    }
    if (new Date(form.end_time) <= new Date(form.start_time)) {
      toast.error("End time must be after start time");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        title: form.title.trim() || "Online Meetup",
        meet_url: form.meet_url.trim(),
        start_time: fromLocalInput(form.start_time),
        end_time: fromLocalInput(form.end_time),
        status_override: form.status_override,
      };
      if (editing) {
        await base44.entities.Meetup.update(editing.id, payload);
        toast.success("Meetup updated");
      } else {
        await base44.entities.Meetup.create(payload);
        toast.success("Meetup scheduled");
      }
      setFormOpen(false);
      setEditing(null);
      load();
    } catch (e) {
      toast.error("Could not save meetup");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (m) => {
    if (!confirm(`Delete "${m.title}"?`)) return;
    try {
      await base44.entities.Meetup.delete(m.id);
      toast.success("Meetup deleted");
      load();
    } catch (e) {
      toast.error("Could not delete");
    }
  };

  const statusBadge = (st) => {
    if (st === "live")
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-700">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" /> LIVE
        </span>
      );
    if (st === "upcoming")
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
          <CalendarClock className="h-3 w-3" /> Upcoming
        </span>
      );
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
        <CheckCircle2 className="h-3 w-3" /> Completed
      </span>
    );
  };

  return (
    <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Video className="h-5 w-5 text-blue-600" />
          <h3 className="text-sm font-bold text-slate-800">Meetup Schedule</h3>
        </div>
        <Button size="sm" onClick={openCreate}>
          <Plus className="mr-1 h-4 w-4" /> New
        </Button>
      </div>

      {formOpen && (
        <div className="mb-4 space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
          <div className="space-y-1">
            <Label>Title</Label>
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Online Meetup"
            />
          </div>
          <div className="space-y-1">
            <Label>Google Meet URL</Label>
            <Input
              value={form.meet_url}
              onChange={(e) => setForm({ ...form, meet_url: e.target.value })}
              placeholder="https://meet.google.com/xxx-xxxx-xxx"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Start</Label>
              <Input
                type="datetime-local"
                value={form.start_time}
                onChange={(e) => setForm({ ...form, start_time: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label>End</Label>
              <Input
                type="datetime-local"
                value={form.end_time}
                onChange={(e) => setForm({ ...form, end_time: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-1">
            <Label>Status</Label>
            <div className="flex flex-wrap gap-2">
              {STATUSES.map((st) => (
                <button
                  key={st.value}
                  type="button"
                  onClick={() => setForm({ ...form, status_override: st.value })}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                    form.status_override === st.value
                      ? "bg-indigo-600 text-white"
                      : "bg-white text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <Button variant="outline" size="sm" onClick={() => setFormOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSave} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-1 h-4 w-4 animate-spin" /> Saving...
                </>
              ) : editing ? (
                "Update"
              ) : (
                "Schedule"
              )}
            </Button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-6">
          <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
        </div>
      ) : meetups.length === 0 ? (
        <p className="py-4 text-center text-sm text-slate-400">No meetups scheduled yet</p>
      ) : (
        <div className="space-y-2">
          {meetups.map((m) => {
            const st = statusOf(m);
            return (
              <div
                key={m.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-medium text-slate-800">{m.title}</span>
                    {statusBadge(st)}
                  </div>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {new Date(m.start_time).toLocaleString(undefined, {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    →{" "}
                    {new Date(m.end_time).toLocaleString(undefined, {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEdit(m)}
                    className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(m)}
                    className="rounded-lg p-1.5 text-rose-400 transition hover:bg-rose-50 hover:text-rose-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}