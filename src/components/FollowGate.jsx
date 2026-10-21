import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { MessageCircle, Check, ExternalLink, Loader2, Lock } from "lucide-react";

const WA_URL = "https://whatsapp.com/channel/0029Vb85g354yltQpBgEMH2b";
const STORAGE_KEY = "dreamiit_followed_v2";
const CONFIRM_DELAY_SEC = 10;

export default function FollowGate({ onDone }) {
  const [waOpened, setWaOpened] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [countdown, setCountdown] = useState(CONFIRM_DELAY_SEC);
  const startedRef = useRef(false);

  const bothOpened = waOpened;

  useEffect(() => {
    if (!bothOpened || startedRef.current) return;
    startedRef.current = true;
    setCountdown(CONFIRM_DELAY_SEC);
    const interval = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(interval);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [bothOpened]);

  const handleConfirm = async () => {
    if (!bothOpened || countdown > 0) return;
    setSubmitting(true);
    try {
      let did = localStorage.getItem("dreamiit_device_id");
      if (!did) {
        did = "dev_" + Math.random().toString(36).slice(2) + Date.now().toString(36);
        localStorage.setItem("dreamiit_device_id", did);
      }
      await base44.entities.ChannelFollow.create({ device_id: did });
    } catch {
      /* ignore — still let the user through */
    }
    try {
      localStorage.setItem(STORAGE_KEY, "true");
    } catch {
      /* ignore */
    }
    setSubmitting(false);
    onDone?.();
  };

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const canConfirm = bothOpened && countdown === 0 && !submitting;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onContextMenu={(e) => e.preventDefault()}
    >
      <div className="flex max-h-[66vh] w-full max-w-sm flex-col overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-float">
        <div className="mb-3 flex justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
            <Lock className="h-6 w-6" />
          </div>
        </div>
        <h2 className="text-center text-base font-bold text-foreground">
          Follow us to access resources
        </h2>
        <p className="mt-1 text-center text-xs text-muted-foreground">
          It's a one-time step. Open the channel, follow it, then come back
          and confirm.
        </p>

        <div className="mt-4 min-h-0 flex-1 space-y-3 overflow-y-auto">
          <button
            type="button"
            onClick={() => {
              window.open(WA_URL, "_blank", "noopener,noreferrer");
              setWaOpened(true);
            }}
            className={`flex w-full items-center gap-3 rounded-xl border p-3 transition ${
              waOpened
                ? "border-emerald-400/50 bg-emerald-50 dark:border-emerald-500/40 dark:bg-emerald-500/10"
                : "border-border bg-secondary/40 hover:border-emerald-400/40"
            }`}
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400">
              <MessageCircle className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1 text-left">
              <p className="text-sm font-bold text-foreground">WhatsApp Channel</p>
              <p className="truncate text-[10px] text-muted-foreground">Dream IIT Community</p>
            </div>
            {waOpened ? (
              <Check className="h-5 w-5 shrink-0 text-emerald-500" />
            ) : (
              <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground" />
            )}
          </button>
        </div>

        <button
          type="button"
          onClick={handleConfirm}
          disabled={!canConfirm}
          className={`mt-4 flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition ${
            canConfirm
              ? "bg-primary text-primary-foreground hover:bg-primary/90"
              : "cursor-not-allowed bg-secondary text-muted-foreground"
          }`}
        >
          {submitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : bothOpened && countdown > 0 ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Please follow... ({countdown}s)
            </>
          ) : (
            <>
              <Check className="h-4 w-4" /> I've followed
            </>
          )}
        </button>
        {!bothOpened ? (
          <p className="mt-2 text-center text-[10px] text-muted-foreground">
            Open the channel above to continue
          </p>
        ) : countdown > 0 ? (
          <p className="mt-2 text-center text-[10px] text-muted-foreground">
            Follow the channel, then wait for the timer to finish
          </p>
        ) : (
          <p className="mt-2 text-center text-[10px] text-emerald-500">
            Done! Tap confirm to access resources
          </p>
        )}
      </div>
    </div>
  );
}

export function hasFollowedChannels() {
  try {
    return localStorage.getItem(STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}