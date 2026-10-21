import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Download, Sparkles, ArrowRight } from "lucide-react";

export default function DownloadAppBanner() {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const data = await base44.entities.AppConfig.list("-created_date", 1);
        if (alive) setConfig(Array.isArray(data) && data[0] ? data[0] : null);
      } catch {
        /* ignore */
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  if (loading || !config || !config.download_visible || !config.download_url) return null;

  return (
    <section className="mx-auto max-w-6xl px-4 pt-6 sm:px-6">
      <div className="sheen relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-card sm:p-6">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <Download className="h-5 w-5" />
            </div>
            <div>
              <span className="inline-flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary-foreground">
                <Sparkles className="h-2.5 w-2.5" /> New Update
              </span>
              <h3 className="mt-1.5 text-base font-bold text-foreground">
                {config.download_label || "Download App"}
              </h3>
              <p className="text-xs text-muted-foreground">
                Install the Quantum Vault app for faster access
              </p>
            </div>
          </div>
          <a
            href={config.download_url}
            target="_blank"
            rel="noopener noreferrer"
            className="press-feedback inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90 hover:shadow-md sm:w-auto"
          >
            <Download className="h-4 w-4" /> Download App
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </section>
  );
}