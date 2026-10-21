import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminAccess } from "@/hooks/useAdminAccess";
import {
  FolderOpen,
  Sparkles,
  Share2,
  Zap,
  Gift,
  RefreshCw,
} from "lucide-react";
import ExitRatingPrompt from "@/components/ExitRatingPrompt";
import MeetupCard from "@/components/MeetupCard";
import FeaturePoints from "@/components/FeaturePoints";
import PullToRefresh from "@/components/PullToRefresh";
import PinnedItems from "@/components/PinnedItems";
import AppHeader from "@/components/AppHeader";
import ShareApp from "@/components/ShareApp";
import DownloadAppBanner from "@/components/DownloadAppBanner";
import { Button } from "@/components/ui/button";

const STATS = [
  { icon: Gift, label: "100% Free", sub: "Forever" },
  { icon: Zap, label: "All Subjects", sub: "PCM covered" },
  { icon: RefreshCw, label: "Updated", sub: "Regularly" },
];

export default function Home({ simplified = false }) {
  const navigate = useNavigate();
  const {
    unlocked,
    modalOpen,
    step,
    passwordInput,
    setPasswordInput,
    error,
    openModal,
    closeModal,
    submitPassword,
  } = useAdminAccess();
  const isAdmin = unlocked;

  const wasModalOpen = useRef(false);
  useEffect(() => {
    if (modalOpen) {
      wasModalOpen.current = true;
    } else if (wasModalOpen.current && isAdmin) {
      wasModalOpen.current = false;
      navigate("/admin");
    }
  }, [modalOpen, isAdmin]);

  const handleRefresh = async () => {
    // Hard reload to fetch the latest deployed version and fresh data
    if (caches) {
      try {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      } catch (e) {
        /* ignore */
      }
    }
    window.location.reload(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader
        isAdmin={isAdmin}
        onLogoClick={() => (isAdmin ? navigate("/admin") : openModal())}
        adminModal={{
          open: modalOpen,
          step,
          passwordInput,
          setPasswordInput,
          error,
          onClose: closeModal,
          onSubmitPassword: submitPassword,
        }}
      />

      {!simplified && <DownloadAppBanner />}

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <PullToRefresh onRefresh={handleRefresh}>
          {/* Hero */}
          <section className="mb-10 animate-fade-in">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold text-primary">
              <Sparkles className="h-3.5 w-3.5" /> JEE Preparation Hub
            </span>
            <h1 className="mt-4 text-3xl font-extrabold leading-[1.1] tracking-tight text-foreground sm:text-4xl md:text-5xl">
              Free JEE resources,
              <br />
              <span className="text-primary">organized for you.</span>
            </h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">
              Browse curated notes, PYQs, DPPs, books and more — all in one
              place, free forever.
            </p>

            {/* CTAs */}
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button size="lg" onClick={() => navigate("/resources")}>
                <FolderOpen className="h-4 w-4" /> Browse Resources
              </Button>
              {simplified && (
                <Button
                  size="lg"
                  variant="secondary"
                  onClick={handleRefresh}
                  className="sm:ml-auto"
                >
                  <RefreshCw className="h-4 w-4" /> Refresh
                </Button>
              )}
            </div>

            {/* Stat strip */}
            <div className="mt-8 grid grid-cols-3 gap-3">
              {STATS.map((s) => (
                <div
                  key={s.label}
                  className="rounded-xl border border-border bg-card p-3 text-center shadow-card sm:p-4"
                >
                  <s.icon className="mx-auto h-5 w-5 text-primary" />
                  <p className="mt-2 text-sm font-bold text-foreground sm:text-base">
                    {s.label}
                  </p>
                  <p className="text-[11px] text-muted-foreground">{s.sub}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Pinned */}
          <section className="mb-10">
            <PinnedItems />
          </section>

          {/* Meetup */}
          <section className="mb-10">
            <MeetupCard />
          </section>

          {/* Features */}
          <section className="mb-10">
            <FeaturePoints />
          </section>

          {/* Share */}
          <section className="mb-4">
            <div className="rounded-2xl border border-border bg-card p-5 shadow-card sm:p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                  <Share2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">
                    Share with friends
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Help others find free JEE resources
                  </p>
                </div>
              </div>
              <ShareApp />
            </div>
          </section>

        </PullToRefresh>
      </main>

      <ExitRatingPrompt />
    </div>
  );
}