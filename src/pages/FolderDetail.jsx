import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useAdminAccess } from "@/hooks/useAdminAccess";
import {
  Plus,
  ArrowLeft,
  Folder as FolderIcon,
  Search,
  MessageCircle,
  ShieldCheck,
  Lock,
  BookPlus,
  ExternalLink,
} from "lucide-react";
import ResourceRequestModal from "@/components/ResourceRequestModal";
import AdminUnlockModal from "@/components/AdminUnlockModal";
import ExitRatingPrompt from "@/components/ExitRatingPrompt";
import ThemeToggle from "@/components/ThemeToggle";
import NotificationBar from "@/components/NotificationBar";

const WHATSAPP_CHANNEL_URL = "https://whatsapp.com/channel/0029Vb85g354yltQpBgEMH2b";
import LinkCard from "@/components/links/LinkCard";
import LinkForm from "@/components/links/LinkForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const accentBar = {
  blue: "bg-blue-500",
  green: "bg-emerald-500",
  purple: "bg-violet-500",
  orange: "bg-orange-500",
  rose: "bg-rose-500",
  cyan: "bg-cyan-500",
  amber: "bg-amber-500",
  indigo: "bg-indigo-500",
};

const iconBg = {
  blue: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
  green: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
  purple: "bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400",
  orange: "bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400",
  rose: "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400",
  cyan: "bg-cyan-50 text-cyan-600 dark:bg-cyan-500/10 dark:text-cyan-400",
  amber: "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
  indigo: "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400",
};

export default function FolderDetail() {
  const { id } = useParams();
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
    lock,
  } = useAdminAccess();
  const isAdmin = unlocked;
  const [folder, setFolder] = useState(null);
  const [links, setLinks] = useState([]);
  const [allLinks, setAllLinks] = useState([]);
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [requestOpen, setRequestOpen] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [f, l, allL, allFolders] = await Promise.all([
        base44.entities.Folder.get(id),
        base44.entities.ResourceLink.filter({ folder_id: id }, "-created_date", 500),
        base44.entities.ResourceLink.list("-created_date", 500),
        base44.entities.Folder.list("-created_date", 200),
      ]);
      setFolder(f);
      setLinks(Array.isArray(l) ? l : []);
      setAllLinks(Array.isArray(allL) ? allL : []);
      setFolders(Array.isArray(allFolders) ? allFolders : []);
    } catch (e) {
      toast.error("Could not load folder");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const q = search.trim().toLowerCase();
  const filtered = q
    ? links.filter(
        (l) =>
          l.title.toLowerCase().includes(q) ||
          (l.description || "").toLowerCase().includes(q)
      )
    : links;

  const otherFolderMatches = q
    ? allLinks.filter(
        (l) =>
          l.folder_id !== id &&
          (l.title.toLowerCase().includes(q) ||
            (l.description || "").toLowerCase().includes(q))
      )
    : [];

  const folderNameById = folders.reduce((acc, f) => {
    acc[f.id] = f.name;
    return acc;
  }, {});

  const handleSubmit = async (data) => {
    try {
      if (editing) {
        await base44.entities.ResourceLink.update(editing.id, data);
        toast.success("Resource updated");
      } else {
        await base44.entities.ResourceLink.create({ ...data, folder_id: id });
        toast.success("Resource added");
      }
      setFormOpen(false);
      setEditing(null);
      load();
    } catch (e) {
      toast.error("Something went wrong");
    }
  };

  const handleDelete = async (link) => {
    if (!confirm(`Delete "${link.title}"?`)) return;
    try {
      await base44.entities.ResourceLink.delete(link.id);
      toast.success("Resource deleted");
      load();
    } catch (e) {
      toast.error("Could not delete");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
          <div className="h-8 w-40 animate-pulse rounded bg-secondary" />
          <div className="mt-6 space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 animate-pulse rounded-xl bg-secondary" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Folder header */}
      <div className="border-b border-border bg-card">
        <div className={`h-1 w-full ${accentBar[folder?.color] || accentBar.blue}`} />
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="flex h-16 items-center justify-between gap-3">
            <button
              onClick={() => navigate("/")}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground transition hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" /> All Folders
            </button>
            <div className="flex items-center gap-1.5">
              <NotificationBar inline />
              <ThemeToggle inline />
              {isAdmin && (
                <>
                  <span className="hidden items-center gap-1.5 rounded-full bg-accent px-3 py-1.5 text-xs font-semibold text-accent-foreground sm:inline-flex">
                    <ShieldCheck className="h-3.5 w-3.5" /> Admin
                  </span>
                  <button
                    onClick={lock}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition hover:text-foreground hover:border-foreground/20"
                    aria-label="Lock admin"
                  >
                    <Lock className="h-4 w-4" />
                  </button>
                </>
              )}
              <a
                href={WHATSAPP_CHANNEL_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition hover:text-foreground hover:border-foreground/20"
                aria-label="WhatsApp"
              >
                <MessageCircle className="h-[18px] w-[18px]" />
              </a>
            </div>
          </div>

          {/* Folder title block */}
          <div className="flex items-center gap-4 pb-6 pt-2">
            <div
              className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${
                iconBg[folder?.color] || iconBg.blue
              }`}
            >
              <FolderIcon className="h-7 w-7" />
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-2xl font-extrabold tracking-tight text-foreground">
                {folder?.name}
              </h1>
              {folder?.description && (
                <p className="mt-0.5 truncate text-sm text-muted-foreground">
                  {folder.description}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        {/* Toolbar */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search resources..."
              className="pl-9"
            />
          </div>
          {isAdmin && (
            <Button
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
            >
              <Plus className="h-4 w-4" /> Add Resource
            </Button>
          )}
        </div>

        {/* Links */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card py-16 text-center">
            {search.trim() ? (
              <>
                <Search className="h-10 w-10 text-muted-foreground" />
                <p className="mt-3 font-semibold text-foreground">
                  No resources found in this folder
                </p>
                {otherFolderMatches.length > 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Check below for matches in other folders
                  </p>
                ) : (
                  <>
                    <p className="text-sm text-muted-foreground">
                      Can't find it? Request it and admin will add it.
                    </p>
                    <Button
                      onClick={() => setRequestOpen(true)}
                      variant="outline"
                      className="mt-4"
                    >
                      <BookPlus className="h-4 w-4" /> Request Resource
                    </Button>
                  </>
                )}
              </>
            ) : (
              <>
                <FolderIcon className="h-10 w-10 text-muted-foreground" />
                <p className="mt-3 font-semibold text-foreground">No resources yet</p>
                <p className="text-sm text-muted-foreground">
                  Add your first Google Drive link to this folder
                </p>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((link) => (
              <LinkCard
                key={link.id}
                link={link}
                isAdmin={isAdmin}
                onEdit={(l) => {
                  setEditing(l);
                  setFormOpen(true);
                }}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}

        {/* Cross-folder search matches */}
        {search.trim() && otherFolderMatches.length > 0 && (
          <div className="mt-8">
            <h3 className="mb-3 text-sm font-semibold text-muted-foreground">
              Found in other folders ({otherFolderMatches.length})
            </h3>
            <div className="space-y-2">
              {otherFolderMatches.map((link) => (
                <div
                  key={link.id}
                  className="press-feedback flex items-center gap-3 rounded-xl border border-border bg-card p-3"
                >
                  <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <h4 className="truncate text-sm font-medium text-foreground">
                      {link.title}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      in {folderNameById[link.folder_id] || "another folder"}
                    </p>
                  </div>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition hover:bg-primary/90"
                  >
                    Open
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <ResourceRequestModal open={requestOpen} onClose={() => setRequestOpen(false)} />

      <LinkForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSubmit={handleSubmit}
        editingLink={editing}
      />

      <AdminUnlockModal
        open={modalOpen}
        step={step}
        passwordInput={passwordInput}
        setPasswordInput={setPasswordInput}
        error={error}
        onClose={closeModal}
        onSubmitPassword={submitPassword}
      />

      <ExitRatingPrompt />
    </div>
  );
}