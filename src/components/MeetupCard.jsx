import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Video, ExternalLink, Radio, CheckCircle2, CalendarClock } from "lucide-react";

const DEFAULT_MEET_URL = "https://meet.google.com/nzk-tfcj-jfx";

function getStatus(meetup, now) {
  if (!meetup) return "upcoming";
  if (meetup.status_override && meetup.status_override !== "auto") {
    return meetup.status_override;
  }
  const start = new Date(meetup.start_time).getTime();
  const end = new Date(meetup.end_time).getTime();
  if (now < start) return "upcoming";
  if (now >= start && now < end) return "live";
  return "completed";
}

function fmt(iso) {
  try {
    return new Date(iso).toLocaleString(undefined, {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

const STYLES = {
  live: {
    ring: "border-emerald-500/40 bg-emerald-50 dark:bg-emerald-500/5",
    icon: "bg-emerald-500 text-white",
    badge: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400",
    sub: "text-emerald-700 dark:text-emerald-400",
  },
  upcoming: {
    ring: "border-border bg-card",
    icon: "bg-primary text-primary-foreground",
    badge: "bg-secondary text-muted-foreground",
    sub: "text-muted-foreground",
  },
  completed: {
    ring: "border-border bg-secondary/40",
    icon: "bg-muted text-muted-foreground",
    badge: "bg-secondary text-muted-foreground",
    sub: "text-muted-foreground",
  },
};

export default function MeetupCard() {
  const [meetup, setMeetup] = useState(null);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const load = async () => {
      try {
        const data = await base44.entities.Meetup.list("-created_date", 1);
        setMeetup(Array.isArray(data) && data[0] ? data[0] : null);
      } catch {
        /* ignore */
      }
    };
    load();
    const t = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(t);
  }, []);

  const status = getStatus(meetup, now);
  const meetUrl = meetup?.meet_url || DEFAULT_MEET_URL;
  const s = STYLES[status];

  const openMeet = () => {
    if (status === "completed") return;
    const ua = navigator.userAgent || "";
    const isAndroidWebView = /android/i.test(ua) && (/; wv\)/i.test(ua) || /webview/i.test(ua));
    if (isAndroidWebView) {
      try {
        const intentUrl =
          meetUrl.replace(/^https?:\/\//, "intent://") +
          "#Intent;scheme=https;action=android.intent.action.VIEW;end;";
        window.location.href = intentUrl;
        return;
      } catch {
        /* fall through */
      }
    }
    const win = window.open(meetUrl, "_blank", "noopener,noreferrer");
    if (!win) window.location.href = meetUrl;
  };

  const title = meetup?.title || "Online Meetup";

  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <Video className="h-4 w-4 text-primary" />
        <h2 className="section-eyebrow">Live Sessions</h2>
      </div>
      <button
        type="button"
        onClick={openMeet}
        disabled={status === "completed"}
        className={`flex w-full items-center justify-between rounded-2xl border p-4 text-left shadow-card transition hover:shadow-card-hover disabled:cursor-not-allowed ${s.ring}`}
      >
        <div className="flex items-center gap-3">
          <div className={`flex h-11 w-11 items-center justify-center rounded-xl shadow-sm ${s.icon}`}>
            <Video className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-foreground">{title}</h3>
              {status === "live" && (
                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${s.badge}`}>
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" />
                  LIVE
                </span>
              )}
              {status === "upcoming" && (
                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${s.badge}`}>
                  <CalendarClock className="h-3 w-3" /> Upcoming
                </span>
              )}
              {status === "completed" && (
                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${s.badge}`}>
                  <CheckCircle2 className="h-3 w-3" /> Completed
                </span>
              )}
            </div>
            <p className={`text-xs ${s.sub}`}>
              {status === "live" && "Session in progress — tap to join"}
              {status === "upcoming" &&
                (meetup ? `Starts ${fmt(meetup.start_time)}` : "Live doubt-solving on Google Meet")}
              {status === "completed" && meetup && `Ended ${fmt(meetup.end_time)}`}
            </p>
          </div>
        </div>
        {status === "live" ? (
          <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white">
            <Radio className="h-3.5 w-3.5" /> Join
          </span>
        ) : status === "completed" ? (
          <span className="text-xs font-medium text-muted-foreground">Ended</span>
        ) : (
          <ExternalLink className="h-5 w-5 shrink-0 text-primary" />
        )}
      </button>
    </div>
  );
}