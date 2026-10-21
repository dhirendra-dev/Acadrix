import React, { useState } from "react";
import { Share2, Copy, Check, MessageCircle, Send } from "lucide-react";
import { toast } from "sonner";

const APP_URL = "https://dream-iit-hub.base44.app";
const SHARE_TEXT =
  "Check out Quantum Vault — free JEE study resources, notes, PYQs & DPPs all in one place! ";

export function getShareUrl() {
  return APP_URL;
}

export function getShareText() {
  return SHARE_TEXT;
}

export default function ShareApp({ className = "" }) {
  const [copied, setCopied] = useState(false);

  const shareMessage = `${SHARE_TEXT}${APP_URL}`;

  const handleWhatsApp = () => {
    window.open(
      `https://wa.me/?text=${encodeURIComponent(shareMessage)}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const handleTelegram = () => {
    window.open(
      `https://t.me/share/url?url=${encodeURIComponent(APP_URL)}&text=${encodeURIComponent(
        SHARE_TEXT
      )}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(APP_URL);
      setCopied(true);
      toast.success("Link copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy link");
    }
  };

  const handleNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Quantum Vault",
          text: SHARE_TEXT,
          url: APP_URL,
        });
      } catch {
        /* user cancelled */
      }
    } else {
      handleCopy();
    }
  };

  const btnBase =
    "flex flex-col items-center gap-2 rounded-xl border border-border bg-card px-3 py-3.5 text-xs font-semibold text-foreground transition hover:border-foreground/20 hover:bg-secondary";

  return (
    <div className={`grid grid-cols-4 gap-2.5 ${className}`}>
      <button type="button" onClick={handleWhatsApp} className={btnBase}>
        <MessageCircle className="h-5 w-5 text-emerald-500" />
        WhatsApp
      </button>
      <button type="button" onClick={handleTelegram} className={btnBase}>
        <Send className="h-5 w-5 text-sky-500" />
        Telegram
      </button>
      <button type="button" onClick={handleCopy} className={btnBase}>
        {copied ? (
          <Check className="h-5 w-5 text-emerald-500" />
        ) : (
          <Copy className="h-5 w-5 text-muted-foreground" />
        )}
        {copied ? "Copied" : "Copy"}
      </button>
      <button type="button" onClick={handleNative} className={btnBase}>
        <Share2 className="h-5 w-5 text-primary" />
        More
      </button>
    </div>
  );
}