import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Bell, X, Info, AlertTriangle, Megaphone } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Image as Img } from "@/components/ui/image";
import { toast } from "sonner";

const TYPE_CONFIG = {
  info: { icon: Info, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200" },
  warning: { icon: AlertTriangle, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200" },
  announcement: { icon: Megaphone, color: "text-indigo-600", bg: "bg-indigo-50", border: "border-indigo-200" },
};

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function NotificationBar({ inline = false }) {
  const [notifications, setNotifications] = useState([]);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [dismissedIds, setDismissedIds] = useState(new Set());

  const fetchNotifications = useCallback(async () => {
    try {
      const data = await base44.entities.Notification.filter(
        { active: true },
        "-created_date",
        50
      );
      // Only show notifications whose scheduled time has arrived (or have no schedule)
      const now = Date.now();
      const visible = data.filter(
        (n) => !n.scheduled_at || new Date(n.scheduled_at).getTime() <= now
      );
      setNotifications(visible);

      // Show pop-up toast for new (unseen) notifications
      const seenKey = "dreamiit_seen_notifications";
      const seen = JSON.parse(sessionStorage.getItem(seenKey) || "[]");
      const newOnes = data.filter((n) => !seen.includes(n.id));
      if (newOnes.length > 0) {
        const latest = newOnes[0]; // show the most recent as popup
        const cfg = TYPE_CONFIG[latest.type] || TYPE_CONFIG.info;
        const Icon = cfg.icon;
        toast.custom(
          (t) => (
            <div
              className={`flex items-start gap-3 rounded-xl border ${cfg.border} ${cfg.bg} p-3 shadow-lg max-w-sm`}
            >
              <Icon className={`h-5 w-5 shrink-0 mt-0.5 ${cfg.color}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-900">{latest.title}</p>
                <p className="text-xs text-slate-600 mt-0.5 break-words">{latest.message}</p>
                {latest.image_url && (
                  <Img
                    src={latest.image_url}
                    alt={latest.title}
                    fittingType="fit"
                    className="mt-1.5 h-24 w-full max-w-[200px] rounded-lg object-cover"
                  />
                )}
              </div>
              <button onClick={() => toast.dismiss(t)} className="shrink-0">
                <X className="h-4 w-4 text-slate-400 hover:text-slate-600" />
              </button>
            </div>
          ),
          { duration: 6000 }
        );
        const updatedSeen = [...seen, ...newOnes.map((n) => n.id)];
        sessionStorage.setItem(seenKey, JSON.stringify(updatedSeen));
      }
    } catch (e) {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const unseenCount = notifications.filter((n) => !dismissedIds.has(n.id)).length;

  const openSheet = () => {
    // Mark all current notifications as viewed → clears the unread badge
    setDismissedIds(new Set(notifications.map((n) => n.id)));
    setSheetOpen(true);
  };

  return (
    <>
      {/* Always-visible Bell Icon — fixed top-right */}
      <button
        onClick={openSheet}
        className={
          inline
            ? "relative inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition hover:text-foreground hover:border-foreground/20 active:scale-95"
            : "fixed right-3 top-3 z-50 inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card shadow-float text-muted-foreground transition hover:text-foreground"
        }
        aria-label="Notifications"
      >
        <Bell className={`h-[18px] w-[18px] ${unseenCount > 0 ? "text-primary" : ""}`} />
        {unseenCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold text-primary-foreground">
            {unseenCount > 9 ? "9+" : unseenCount}
          </span>
        )}
      </button>

      {/* Notifications Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-indigo-600" />
              Notifications
            </SheetTitle>
          </SheetHeader>
          <div className="mt-4 space-y-3">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Bell className="h-8 w-8 text-slate-300" />
                <p className="mt-2 text-sm text-slate-400">No notifications yet</p>
              </div>
            ) : (
              notifications.map((n) => {
                const cfg = TYPE_CONFIG[n.type] || TYPE_CONFIG.info;
                const Icon = cfg.icon;
                return (
                  <div
                    key={n.id}
                    className={`rounded-xl border ${cfg.border} ${cfg.bg} p-3`}
                  >
                    <div className="flex items-start gap-2.5">
                      <Icon className={`h-4 w-4 shrink-0 mt-0.5 ${cfg.color}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-900">{n.title}</p>
                        <p className="mt-0.5 text-xs text-slate-600 break-words whitespace-pre-wrap">
                          {n.message}
                        </p>
                        {n.image_url && (
                          <Img
                            src={n.image_url}
                            alt={n.title}
                            fittingType="fit"
                            className="mt-2 h-32 w-full rounded-lg object-cover"
                          />
                        )}
                        <p className="mt-1.5 text-[10px] text-slate-400">
                          {timeAgo(n.created_date)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}