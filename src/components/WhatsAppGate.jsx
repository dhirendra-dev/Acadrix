import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { MessageCircle, Check, ExternalLink, Loader2 } from "lucide-react";

const WA_URL = "https://whatsapp.com/channel/0029Vb85g354yltQpBgEMH2b";
const STORAGE_KEY = "dreamiit_app_whatsapp_v1";
const CLICKED_KEY = "dreamiit_app_whatsapp_clicked_v1";

export default function WhatsAppGate({ onDone }) {
  const [waOpened, setWaOpened] = useState(() => {
    try {
      return localStorage.getItem(CLICKED_KEY) === "true";
    } catch {
      return false;
    }
  });
  const [submitting, setSubmitting] = useState(false);

  const handleWhatsAppClick = () => {
    window.open(WA_URL, "_blank", "noopener,noreferrer");
    setWaOpened(true);
    try {
      localStorage.setItem(CLICKED_KEY, "true");
    } catch {
      /* ignore */
    }
  };

  const handleConfirm = async () => {
    if (!waOpened) return;
    setSubmitting(true);
    try {
      let did = localStorage.getItem("dreamiit_device_id");
      if (!did) {
        did =
          "dev_" + Math.random().toString(36).slice(2) + Date.now().toString(36);
        localStorage.setItem("dreamiit_device_id", did);
      }
      await base44.entities.ChannelFollow.create({ device_id: did });
    } catch {
      /* ignore */
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

  const canConfirm = waOpened && !submitting;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onContextMenu={(e) => e.preventDefault()}
    >
      <div className="flex max-h-[66vh] w-full max-w-sm flex-col overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-float">
        <div className="mb-3 flex justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400">
            <MessageCircle className="h-6 w-6" />
          </div>
        </div>
        <h2 className="text-center text-base font-bold text-foreground">
          Join our WhatsApp Channel
        </h2>
        <p className="mt-1 text-center text-xs text-muted-foreground">
          It's a one-time step. Open the WhatsApp channel, then come back and
          tap continue to access all resources.
        </p>

        <div className="mt-4 min-h-0 flex-1 space-y-3 overflow-y-auto">
          <button
            type="button"
            onClick={handleWhatsAppClick}
            className={`press-feedback flex w-full items-center gap-3 rounded-xl border p-3 transition ${
              waOpened
                ? "border-emerald-400/50 bg-emerald-50 dark:border-emerald-500/40 dark:bg-emerald-500/10"
                : "border-border bg-secondary/40 hover:border-emerald-400/40"
            }`}
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400">
              <MessageCircle className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1 text-left">
              <p className="text-sm font-bold text-foreground">
                WhatsApp Channel
              </p>
              <p className="truncate text-[10px] text-muted-foreground">
                Dream IIT Community
              </p>
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
          className={`press-feedback mt-4 flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition ${
            canConfirm
              ? "bg-emerald-500 text-white hover:bg-emerald-600"
              : "cursor-not-allowed bg-secondary text-muted-foreground"
          }`}
        >
          {submitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <Check className="h-4 w-4" /> I've followed — Continue
            </>
          )}
        </button>
        {!waOpened ? (
          <p className="mt-2 text-center text-[10px] text-muted-foreground">
            Open the WhatsApp channel above to continue
          </p>
        ) : (
          <p className="mt-2 text-center text-[10px] text-emerald-500">
            Done! Tap continue to access resources
          </p>
        )}
      </div>
    </div>
  );
}

export function hasAppWhatsApp() {
  try {
    return localStorage.getItem(STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}