import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Bell, Plus, Trash2, Loader2, Megaphone, Clock, CalendarClock, ImagePlus, X } from "lucide-react";
import { toast } from "sonner";
import { Image as Img } from "@/components/ui/image";

const TYPES = [
  { value: "info", label: "Info", color: "bg-blue-100 text-blue-700" },
  { value: "warning", label: "Warning", color: "bg-amber-100 text-amber-700" },
  { value: "announcement", label: "Announcement", color: "bg-indigo-100 text-indigo-700" },
];

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState("info");
  const [scheduledAt, setScheduledAt] = useState(""); // empty = send now
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleImageUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setImageUrl(file_url);
      toast.success("Photo uploaded");
    } catch (e) {
      toast.error("Could not upload photo");
    } finally {
      setUploading(false);
    }
  };

  const load = async () => {
    try {
      const data = await base44.entities.Notification.list("-created_date", 50);
      setNotifications(Array.isArray(data) ? data : []);
    } catch (e) {
      /* ignore */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async () => {
    if (!title.trim() || !message.trim()) {
      toast.error("Title and message are required");
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        title: title.trim(),
        message: message.trim(),
        type,
        active: true,
        image_url: imageUrl || "",
      };
      if (scheduledAt) {
        payload.scheduled_at = new Date(scheduledAt).toISOString();
      }
      await base44.entities.Notification.create(payload);
      toast.success(scheduledAt ? "Notification scheduled!" : "Notification sent!");
      setTitle("");
      setMessage("");
      setType("info");
      setScheduledAt("");
      setImageUrl("");
      setShowForm(false);
      load();
    } catch (e) {
      toast.error("Could not send notification");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this notification?")) return;
    try {
      await base44.entities.Notification.delete(id);
      toast.success("Notification deleted");
      load();
    } catch (e) {
      toast.error("Could not delete");
    }
  };

  const handleToggle = async (n) => {
    try {
      await base44.entities.Notification.update(n.id, { active: !n.active });
      load();
    } catch (e) {
      toast.error("Could not update");
    }
  };

  return (
    <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-bold text-slate-900">
          <Megaphone className="h-4 w-4 text-indigo-600" /> Notifications
        </h2>
        <Button
          size="sm"
          variant={showForm ? "outline" : "default"}
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? (
            "Cancel"
          ) : (
            <>
              <Plus className="mr-1 h-4 w-4" /> New
            </>
          )}
        </Button>
      </div>

      {showForm && (
        <div className="mb-4 space-y-3 rounded-xl bg-slate-50 p-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">Title</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Notification title..."
              className="bg-white"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">Message</label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message exactly as students should see it..."
              rows={3}
              className="resize-none bg-white"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">Type</label>
            <div className="flex gap-2">
              {TYPES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setType(t.value)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                    type === t.value
                      ? t.color + " ring-2 ring-offset-1 ring-slate-300"
                      : "bg-white text-slate-500 border border-slate-200"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">Photo (optional)</label>
            {imageUrl ? (
              <div className="relative inline-block">
                <Img
                  src={imageUrl}
                  alt="notification preview"
                  fittingType="fit"
                  className="h-28 w-full max-w-xs rounded-lg border border-slate-200 object-cover"
                />
                <button
                  type="button"
                  onClick={() => setImageUrl("")}
                  className="absolute -right-1.5 -top-1.5 rounded-full bg-rose-500 p-1 text-white shadow hover:bg-rose-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ) : (
              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 bg-white px-3 py-3 text-xs font-medium text-slate-500 transition hover:border-indigo-300 hover:text-indigo-600">
                {uploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Uploading...
                  </>
                ) : (
                  <>
                    <ImagePlus className="h-4 w-4" /> Upload photo
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleImageUpload(e.target.files?.[0])}
                  disabled={uploading}
                />
              </label>
            )}
          </div>
          <div>
            <label className="mb-1 flex items-center gap-1.5 text-xs font-medium text-slate-600">
              <CalendarClock className="h-3.5 w-3.5" /> Schedule (optional)
            </label>
            <Input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              className="bg-white"
            />
            <p className="mt-1 text-[10px] text-slate-400">
              {scheduledAt
                ? `Will appear on ${new Date(scheduledAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}`
                : "Leave empty to send immediately"}
            </p>
          </div>
          <Button
            onClick={handleCreate}
            disabled={submitting}
            className="w-full"
          >
            {submitting ? (
              <>
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> Sending...
              </>
            ) : scheduledAt ? (
              <>
                <CalendarClock className="mr-1.5 h-4 w-4" /> Schedule Notification
              </>
            ) : (
              <>
                <Bell className="mr-1.5 h-4 w-4" /> Send Notification
              </>
            )}
          </Button>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-4">
          <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
        </div>
      ) : notifications.length === 0 ? (
        <p className="py-4 text-center text-xs text-slate-400">
          No notifications sent yet
        </p>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`flex items-start justify-between gap-2 rounded-lg border p-2.5 ${
                n.active
                  ? "border-slate-200 bg-white"
                  : "border-slate-100 bg-slate-50 opacity-60"
              }`}
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${
                    TYPES.find((t) => t.value === n.type)?.color || "bg-slate-100 text-slate-600"
                  }`}>
                    {n.type}
                  </span>
                  {!n.active && (
                    <span className="text-[9px] font-bold text-slate-400">INACTIVE</span>
                  )}
                  {n.scheduled_at && new Date(n.scheduled_at) > new Date() && (
                    <span className="inline-flex items-center gap-0.5 rounded-full bg-violet-100 px-2 py-0.5 text-[9px] font-bold text-violet-700">
                      <Clock className="h-2.5 w-2.5" /> SCHEDULED
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm font-semibold text-slate-800">{n.title}</p>
                <p className="text-xs text-slate-500 break-words">{n.message}</p>
                {n.image_url && (
                  <Img
                    src={n.image_url}
                    alt={n.title}
                    fittingType="fit"
                    className="mt-2 h-20 w-full max-w-[180px] rounded-lg border border-slate-200 object-cover"
                  />
                )}
                {n.scheduled_at && (
                  <p className="mt-1 flex items-center gap-1 text-[10px] text-violet-600">
                    <Clock className="h-3 w-3" />
                    {new Date(n.scheduled_at) > new Date() ? "Appears: " : "Appeared: "}
                    {new Date(n.scheduled_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                  </p>
                )}
              </div>
              <div className="flex shrink-0 flex-col gap-1">
                <button
                  onClick={() => handleToggle(n)}
                  className="rounded px-2 py-1 text-[10px] font-medium text-indigo-600 hover:bg-indigo-50"
                >
                  {n.active ? "Hide" : "Show"}
                </button>
                <button
                  onClick={() => handleDelete(n.id)}
                  className="rounded px-2 py-1 text-[10px] font-medium text-red-500 hover:bg-red-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}