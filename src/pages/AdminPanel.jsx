import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAdminAccess } from "@/hooks/useAdminAccess";
import { ArrowLeft, ShieldCheck, Lock, Users, Download, MessageCircle, Settings, FileText, BarChart3, UsersRound, BookPlus, Bell, MessageSquare, Loader2, RefreshCw } from "lucide-react";
import AdminUnlockModal from "@/components/AdminUnlockModal";
import { fetchAllSessions } from "@/lib/sessionUtils";
import AdminAnalytics from "@/components/admin/AdminAnalytics";
import AdminNotifications from "@/components/admin/AdminNotifications";
import AdminResourceRequests from "@/components/admin/AdminResourceRequests";
import AdminRatings from "@/components/admin/AdminRatings";
import AdminDeletions from "@/components/admin/AdminDeletions";
import AdminFollows from "@/components/admin/AdminFollows";
import AdminMeetups from "@/components/admin/AdminMeetups";
import AdminStandalonePdfs from "@/components/admin/AdminStandalonePdfs";
import AdminRjSirPdfs from "@/components/admin/AdminRjSirPdfs";
import AdminAppConfig from "@/components/admin/AdminAppConfig";
import ThemeToggle from "@/components/ThemeToggle";
import NotificationBar from "@/components/NotificationBar";

const LOGO_URL = "https://media.base44.com/images/public/6a4fdf2b258cb191501a9b70/8110b5b8f_file_000000005ad88211bae5cf9879f6baf9.png";

const TABS = [
  { id: "config", label: "Config", icon: Settings },
  { id: "pdfs", label: "PDFs", icon: FileText },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "community", label: "Community", icon: UsersRound },
  { id: "requests", label: "Requests", icon: BookPlus },
  { id: "notifications", label: "Alerts", icon: Bell },
  { id: "feedback", label: "Feedback", icon: MessageSquare },
];

export default function AdminPanel() {
  const navigate = useNavigate();
  const { unlocked, modalOpen, step, passwordInput, setPasswordInput, error, openModal, closeModal, submitPassword, lock } = useAdminAccess();
  const [stats, setStats] = useState({ total: 0, live: 0 });
  const [activeTab, setActiveTab] = useState("config");

  const [statsLoading, setStatsLoading] = useState(false);

  const loadStats = async () => {
    setStatsLoading(true);
    try {
      const all = await fetchAllSessions();
      const fiveMinAgo = Date.now() - 5 * 60 * 1000;
      const live = all.filter(
        (s) => new Date(s.last_active).getTime() > fiveMinAgo
      ).length;
      setStats({ total: all.length, live });
    } catch (e) {
      console.error("AdminPanel: failed to load stats", e);
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    if (!unlocked) {
      openModal();
    } else {
      loadStats();
      const interval = setInterval(loadStats, 30000);
      return () => clearInterval(interval);
    }
  }, [unlocked]);

  if (!unlocked) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
        <img
          src={LOGO_URL}
          alt="Quantum Vault"
          className="mb-4 h-16 w-16 rounded-2xl object-cover ring-1 ring-border"
        />
        <h1 className="text-lg font-bold text-foreground">Admin Access Locked</h1>
        <p className="mt-1 max-w-xs text-sm text-muted-foreground">
          Tap below to verify and unlock the admin panel.
        </p>
        <button
          onClick={openModal}
          className="mt-5 inline-flex items-center gap-1.5 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
        >
          <Lock className="h-4 w-4" /> Unlock
        </button>
        <Link
          to="/"
          className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Home
        </Link>
        <AdminUnlockModal
          open={modalOpen}
          step={step}
          passwordInput={passwordInput}
          setPasswordInput={setPasswordInput}
          error={error}
          onClose={closeModal}
          onSubmitPassword={submitPassword}
        />
      </div>
    );
  }

  return (
    <div className="admin-panel min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex h-16 items-center justify-between gap-3">
            <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" /> Home
            </Link>
            <div className="flex items-center gap-1.5">
              <NotificationBar inline />
              <ThemeToggle inline />
              <span className="mx-0.5 hidden h-6 w-px bg-border sm:block" />
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-accent-foreground">
                <ShieldCheck className="h-3.5 w-3.5" /> Admin
              </span>
              <button
                onClick={() => {
                  lock();
                  navigate("/");
                }}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-semibold text-muted-foreground transition hover:text-foreground hover:border-foreground/20"
              >
                <Lock className="h-3.5 w-3.5" /> Lock
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="section-eyebrow">Administration</span>
            <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-foreground">Admin Panel</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={loadStats}
              disabled={statsLoading}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground transition hover:bg-secondary disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${statsLoading ? "animate-spin" : ""}`} /> Refresh Stats
            </button>
            <button
              onClick={() => {
                try {
                  localStorage.removeItem("dreamiit_followed_v2");
                } catch {
                  /* ignore */
                }
                navigate("/");
              }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground transition hover:bg-secondary"
            >
              <MessageCircle className="h-4 w-4" /> Preview Follow Gate
            </button>
          </div>
        </div>

        {/* Admin Stats */}
        <div className="mb-6 grid grid-cols-2 gap-4">
          <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
            <div className="flex items-center gap-2 text-primary">
              <Download className="h-4 w-4" />
              <span className="text-xs font-semibold text-muted-foreground">Total Installs</span>
            </div>
            <p className="mt-1 text-2xl font-bold text-foreground">
              {statsLoading && stats.total === 0 ? (
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              ) : (
                stats.total
              )}
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
            <div className="flex items-center gap-2 text-emerald-500">
              <Users className="h-4 w-4" />
              <span className="text-xs font-semibold text-muted-foreground">Live Now</span>
            </div>
            <p className="mt-1 text-2xl font-bold text-foreground">
              {statsLoading && stats.live === 0 ? (
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              ) : (
                stats.live
              )}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex flex-wrap gap-1.5">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`press-feedback inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold transition ${
                activeTab === id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "border border-border bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-3.5 w-3.5" /> {label}
            </button>
          ))}
        </div>

        {/* Active section only — loads its own data on demand */}
        {activeTab === "config" && <AdminAppConfig />}
        {activeTab === "pdfs" && (
          <>
            <AdminStandalonePdfs />
            <AdminRjSirPdfs />
          </>
        )}
        {activeTab === "analytics" && <AdminAnalytics />}
        {activeTab === "community" && (
          <>
            <AdminFollows />
            <AdminMeetups />
          </>
        )}
        {activeTab === "requests" && <AdminResourceRequests />}
        {activeTab === "notifications" && <AdminNotifications />}
        {activeTab === "feedback" && (
          <>
            <AdminRatings />
            <AdminDeletions />
          </>
        )}
      </main>
    </div>
  );
}