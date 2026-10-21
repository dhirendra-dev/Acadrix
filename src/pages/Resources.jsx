import React, { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useAdminAccess } from "@/hooks/useAdminAccess";
import {
  Plus,
  Search,
  BookPlus,
  FolderOpen,
  LayoutGrid,
} from "lucide-react";
import ResourceRequestModal from "@/components/ResourceRequestModal";
import ExitRatingPrompt from "@/components/ExitRatingPrompt";
import PullToRefresh from "@/components/PullToRefresh";
import Watermark from "@/components/Watermark";
import AppHeader from "@/components/AppHeader";
import FolderCard from "@/components/folders/FolderCard";
import LinkCard from "@/components/links/LinkCard";
import FolderForm from "@/components/folders/FolderForm";
import PinnedItems from "@/components/PinnedItems";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function Resources() {
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

  const [folders, setFolders] = useState([]);
  const [counts, setCounts] = useState({});
  const [allLinks, setAllLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [requestOpen, setRequestOpen] = useState(false);

  const loadFolders = async () => {
    setLoading(true);
    try {
      const data = await base44.entities.Folder.list("-created_date", 200);
      setFolders(Array.isArray(data) ? data : []);
    } catch (e) {
      toast.error("Could not load folders");
    } finally {
      setLoading(false);
    }
  };

  const loadCounts = async () => {
    try {
      const links = await base44.entities.ResourceLink.list("-created_date", 500);
      const linkArr = Array.isArray(links) ? links : [];
      const map = {};
      linkArr.forEach((l) => {
        map[l.folder_id] = (map[l.folder_id] || 0) + 1;
      });
      setCounts(map);
      setAllLinks(linkArr);
    } catch (e) {
      /* ignore */
    }
  };

  useEffect(() => {
    loadFolders();
    loadCounts();
  }, []);

  const handleRefresh = async () => {
    await Promise.all([loadFolders(), loadCounts()]);
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return folders
      .filter(
        (f) =>
          !q ||
          f.name.toLowerCase().includes(q) ||
          (f.description || "").toLowerCase().includes(q)
      )
      .slice()
      .sort((a, b) =>
        a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: "base" })
      );
  }, [folders, search]);

  const filteredLinks = useMemo(() => {
    if (!search.trim()) return [];
    const q = search.toLowerCase();
    return allLinks.filter(
      (l) =>
        l.title.toLowerCase().includes(q) ||
        (l.description || "").toLowerCase().includes(q)
    );
  }, [allLinks, search]);

  const handleSubmit = async (data) => {
    try {
      if (editing) {
        await base44.entities.Folder.update(editing.id, data);
        toast.success("Folder updated");
      } else {
        await base44.entities.Folder.create(data);
        toast.success("Folder created");
      }
      setFormOpen(false);
      setEditing(null);
      loadFolders();
    } catch (e) {
      toast.error("Something went wrong");
    }
  };

  const handleDelete = async (folder) => {
    if (!confirm(`Delete "${folder.name}" and all its resources?`)) return;
    try {
      await base44.entities.ResourceLink.deleteMany({ folder_id: folder.id });
      await base44.entities.Folder.delete(folder.id);
      toast.success("Folder deleted");
      loadFolders();
      loadCounts();
    } catch (e) {
      toast.error("Could not delete folder");
    }
  };

  const handleTogglePin = async (folder) => {
    try {
      await base44.entities.Folder.update(folder.id, {
        pinned: !folder.pinned,
      });
      toast.success(folder.pinned ? "Unpinned" : "Pinned to home");
      loadFolders();
    } catch (e) {
      toast.error("Could not update");
    }
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

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <PullToRefresh onRefresh={handleRefresh}>
          <div className="relative">
            <Watermark />

            {/* Page header */}
            <div className="mb-8">
              <span className="section-eyebrow">Resource Library</span>
              <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
                All Resources
              </h1>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Browse folders or search for specific materials across the
                library.
              </p>
            </div>

            {/* Pinned */}
            <div className="mb-8">
              <PinnedItems />
            </div>

            {/* Toolbar */}
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative w-full sm:max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search folders & resources..."
                  className="pl-9"
                />
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={() => setRequestOpen(true)}>
                  <BookPlus className="h-4 w-4" /> Request
                </Button>
                {isAdmin && (
                  <Button
                    onClick={() => {
                      setEditing(null);
                      setFormOpen(true);
                    }}
                  >
                    <Plus className="h-4 w-4" /> New Folder
                  </Button>
                )}
              </div>
            </div>

            {/* Grid */}
            {loading ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="h-44 animate-pulse rounded-2xl bg-secondary"
                  />
                ))}
              </div>
            ) : filtered.length === 0 && filteredLinks.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card py-16 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary">
                  <FolderOpen className="h-7 w-7 text-muted-foreground" />
                </div>
                <p className="mt-4 text-base font-semibold text-foreground">
                  {search ? "No results found" : "No folders yet"}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {search
                    ? "Try a different search term"
                    : "Create your first folder to start adding resources"}
                </p>
                {!search && (
                  <Button
                    onClick={() => setRequestOpen(true)}
                    variant="outline"
                    className="mt-5"
                  >
                    <BookPlus className="h-4 w-4" /> Request a Resource
                  </Button>
                )}
              </div>
            ) : (
              <>
                {filtered.length > 0 && (
                  <>
                    <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                      <LayoutGrid className="h-4 w-4" />
                      {filtered.length} {filtered.length === 1 ? "folder" : "folders"}
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {filtered.map((folder) => (
                        <FolderCard
                          key={folder.id}
                          folder={folder}
                          count={counts[folder.id] || 0}
                          isAdmin={isAdmin}
                          onOpen={(f) => navigate(`/folder/${f.id}`)}
                          onEdit={(f) => {
                            setEditing(f);
                            setFormOpen(true);
                          }}
                          onDelete={handleDelete}
                          onTogglePin={handleTogglePin}
                        />
                      ))}
                    </div>
                  </>
                )}
                {filteredLinks.length > 0 && (
                  <div className={filtered.length > 0 ? "mt-8" : ""}>
                    <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                      <Search className="h-4 w-4" /> Matching Resources (
                      {filteredLinks.length})
                    </h3>
                    <div className="space-y-3">
                      {filteredLinks.map((link) => (
                        <LinkCard key={link.id} link={link} isAdmin={false} />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </PullToRefresh>
      </main>

      <ResourceRequestModal open={requestOpen} onClose={() => setRequestOpen(false)} />
      <ExitRatingPrompt />
      <FolderForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSubmit={handleSubmit}
        editingFolder={editing}
      />
    </div>
  );
}