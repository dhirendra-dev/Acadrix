import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import {
  Pin,
  Folder as FolderIcon,
  FileText,
  ChevronRight,
  Flame,
} from "lucide-react";
import { openExternal } from "@/lib/openExternal";

export default function PinnedItems() {
  const navigate = useNavigate();
  const [pinnedFolders, setPinnedFolders] = useState([]);
  const [pinnedPdfs, setPinnedPdfs] = useState([]);
  const [loading, setLoading] = useState(true);

  const logView = (link) => {
    try {
      let did = localStorage.getItem("dreamiit_device_id");
      if (!did) {
        did = "dev_" + Math.random().toString(36).slice(2) + Date.now().toString(36);
        localStorage.setItem("dreamiit_device_id", did);
      }
      base44.entities.ResourceView.create({
        device_id: did,
        resource_link_id: link.id,
        resource_title: link.title,
        resource_type: link.resource_type || "other",
        folder_id: link.folder_id || "",
      }).catch(() => {});
    } catch {
      /* ignore */
    }
  };

  useEffect(() => {
    const load = async () => {
      try {
        const [folders, links] = await Promise.all([
          base44.entities.Folder.list("-created_date", 200),
          base44.entities.ResourceLink.list("-created_date", 500),
        ]);
        setPinnedFolders(
          (Array.isArray(folders) ? folders : []).filter((f) => f.pinned)
        );
        setPinnedPdfs(
          (Array.isArray(links) ? links : []).filter(
            (l) => l.pinned && !l.folder_id
          )
        );
      } catch (e) {
        /* ignore */
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading || (pinnedFolders.length === 0 && pinnedPdfs.length === 0))
    return null;

  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <Pin className="h-4 w-4 text-primary" />
        <h2 className="section-eyebrow">Pinned for quick access</h2>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {pinnedFolders.map((f) => (
          <button
            key={f.id}
            onClick={() => navigate(`/folder/${f.id}`)}
            className="sheen press-feedback group flex items-center gap-3 rounded-xl border border-border bg-card p-3.5 text-left shadow-card transition hover:border-primary/40 hover:shadow-card-hover"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
              <FolderIcon className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-foreground">
                {f.name}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {f.description || "Pinned folder"}
              </p>
            </div>
            <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-primary" />
          </button>
        ))}
        {pinnedPdfs.map((l) => (
          <a
            key={l.id}
            href={l.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => { openExternal(l.url, e); logView(l); }}
            className="press-feedback group flex items-center gap-3 rounded-xl border border-border bg-card p-3.5 text-left shadow-card transition hover:border-rose-400/50 hover:shadow-card-hover"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400">
              <FileText className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-foreground">
                {l.title}
              </p>
              {l.high_demand ? (
                <span className="inline-flex items-center gap-0.5 rounded-full bg-orange-100 px-1.5 py-0.5 text-[9px] font-bold text-orange-600 dark:bg-orange-500/15 dark:text-orange-400">
                  <Flame className="h-2.5 w-2.5" /> HIGH DEMAND
                </span>
              ) : (
                <p className="truncate text-xs text-muted-foreground">
                  {l.description || "Important PDF"}
                </p>
              )}
            </div>
            <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-primary" />
          </a>
        ))}
      </div>
    </div>
  );
}