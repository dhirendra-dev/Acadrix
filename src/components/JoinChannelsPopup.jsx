import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  MessageCircle,
  X,
  BellOff,
  ExternalLink,
  Check,
  Users,
} from "lucide-react";

const TG_URL = "https://t.me/resource_dreamIIT";
const WA_URL = "https://whatsapp.com/channel/0029Vb85g354yltQpBgEMH2b";
const MUTE_KEY = "dreamiit_join_muted_until";
const CLOSED_KEY = "dreamiit_join_closed_session";
const HOUR_MS = 60 * 60 * 1000;

export default function JoinChannelsPopup({ appRoute = false }) {
  const [open, setOpen] = useState(false);
  const [joined, setJoined] = useState({});

  useEffect(() => {
    try {
      const mutedUntil = Number(localStorage.getItem(MUTE_KEY) || 0);
      if (Date.now() < mutedUntil) return;
      if (sessionStorage.getItem(CLOSED_KEY) === "true") return;
      setOpen(true);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [open]);

  const handleClose = () => {
    try {
      sessionStorage.setItem(CLOSED_KEY, "true");
    } catch {
      /* ignore */
    }
    setOpen(false);
  };

  const handleMute = () => {
    try {
      localStorage.setItem(MUTE_KEY, String(Date.now() + HOUR_MS));
      sessionStorage.setItem(CLOSED_KEY, "true");
    } catch {
      /* ignore */
    }
    setOpen(false);
  };

  const channels = appRoute
    ? [
        {
          key: "wa",
          name: "WhatsApp Channel",
          sub: "Dream IIT Community",
          url: WA_URL,
          Icon: MessageCircle,
          activeClass:
            "border-emerald-400/50 bg-emerald-50 dark:border-emerald-500/40 dark:bg-emerald-500/10",
          iconClass:
            "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400",
        },
      ]
    : [
        {
          key: "tg",
          name: "Telegram Channel",
          sub: "@resource_dreamIIT",
          url: TG_URL,
          Icon: Send,
          activeClass:
            "border-sky-400/50 bg-sky-50 dark:border-sky-500/40 dark:bg-sky-500/10",
          iconClass:
            "bg-sky-100 text-sky-600 dark:bg-sky-500/15 dark:text-sky-400",
        },
        {
          key: "wa",
          name: "WhatsApp Channel",
          sub: "Dream IIT Community",
          url: WA_URL,
          Icon: MessageCircle,
          activeClass:
            "border-emerald-400/50 bg-emerald-50 dark:border-emerald-500/40 dark:bg-emerald-500/10",
          iconClass:
            "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400",
        },
      ];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onContextMenu={(e) => e.preventDefault()}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className="relative w-full max-w-sm overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-float"
          >
            {/* Close */}
            <button
              onClick={handleClose}
              className="press-feedback absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-secondary hover:text-foreground"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Header icon */}
            <div className="mb-3 flex justify-center pt-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
                <Users className="h-6 w-6" />
              </div>
            </div>

            <h2 className="text-center text-base font-bold text-foreground">
              Join our Community
            </h2>
            <p className="mt-1 text-center text-xs text-muted-foreground">
              Stay updated with the latest JEE resources and announcements.
            </p>

            {/* Channel buttons */}
            <div className="mt-4 space-y-2.5">
              {channels.map(
                ({ key, name, sub, url, Icon, activeClass, iconClass }) => {
                  const isJoined = joined[key];
                  return (
                    <a
                      key={key}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() =>
                        setJoined((s) => ({ ...s, [key]: true }))
                      }
                      className={`press-feedback flex w-full items-center gap-3 rounded-xl border p-3 transition ${
                        isJoined
                          ? activeClass
                          : "border-border bg-secondary/40 hover:border-foreground/20"
                      }`}
                    >
                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${iconClass}`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1 text-left">
                        <p className="text-sm font-bold text-foreground">
                          {name}
                        </p>
                        <p className="truncate text-[10px] text-muted-foreground">
                          {sub}
                        </p>
                      </div>
                      {isJoined ? (
                        <Check className="h-5 w-5 shrink-0 text-emerald-500" />
                      ) : (
                        <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground" />
                      )}
                    </a>
                  );
                }
              )}
            </div>

            {/* Footer actions */}
            <div className="mt-4 flex items-center justify-between gap-2">
              <button
                onClick={handleMute}
                className="press-feedback inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-muted-foreground transition hover:bg-secondary hover:text-foreground"
              >
                <BellOff className="h-3.5 w-3.5" /> Mute for 1 hour
              </button>
              <button
                onClick={handleClose}
                className="press-feedback inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition hover:bg-primary/90"
              >
                <X className="h-3.5 w-3.5" /> Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}