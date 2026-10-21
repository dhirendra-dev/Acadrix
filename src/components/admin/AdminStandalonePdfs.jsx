import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import {
  Plus,
  Pin,
  PinOff,
  Pencil,
  Trash2,
  FileText,
  Loader2,
  Flame,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import LinkForm from "@/components/links/LinkForm";

export default function AdminStandalonePdfs() {
  const [links, setLinks] = useState([]);
  const [viewCounts, setViewCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const [all, views] = await Promise.all([
        base44.entities.ResourceLink.list("-created_date", 500),
        base44.entities.ResourceView.list("-created_date", 1000),
      ]);
      const standalone = (Array.isArray(all) ? all : []).filter(
        (l) => !l.folder_id
      );
      setLinks(standalone);
      const counts = {};
      (Array.isArray(views) ? views : []).forEach((v) => {
        counts[v.resource_link_id] = (counts[v.resource_link_id] || 0) + 1;
      });
      setViewCounts(counts);
    } catch (e) {
      /* ignore */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (data) => {
    try {
      if (editing) {
        await base44.entities.ResourceLink.update(editing.id, {
          ...data,
          folder_id: "",
        });
        setLinks((prev) =>
          prev.map((l) =>
            l.id === editing.id ? { ...l, ...data, folder_id: "" } : l
          )
        );
        toast.success("PDF updated");
      } else {
        const created = await base44.entities.ResourceLink.create({
          ...data,
          folder_id: "",
        });
        setLinks((prev) => [{ ...created, folder_id: "" }, ...prev]);
        toast.success("PDF added");
      }
      setFormOpen(false);
      setEditing(null);
    } catch (e) {
      toast.error("Something went wrong");
    }
  };

  const handleDelete = async (link) => {
    if (!confirm(`Delete "${link.title}"?`)) return;
    try {
      await base44.entities.ResourceLink.delete(link.id);
      setLinks((prev) => prev.filter((l) => l.id !== link.id));
      toast.success("PDF deleted");
    } catch (e) {
      toast.error("Could not delete");
    }
  };

  const togglePin = async (link) => {
    try {
      await base44.entities.ResourceLink.update(link.id, {
        pinned: !link.pinned,
      });
      setLinks((prev) =>
        prev.map((l) => (l.id === link.id ? { ...l, pinned: !l.pinned } : l))
      );
      toast.success(link.pinned ? "Unpinned" : "Pinned to home");
    } catch (e) {
      toast.error("Could not update");
    }
  };

  const toggleHighDemand = async (link) => {
    try {
      await base44.entities.ResourceLink.update(link.id, {
        high_demand: !link.high_demand,
      });
      setLinks((prev) =>
        prev.map((l) =>
          l.id === link.id ? { ...l, high_demand: !l.high_demand } : l
        )
      );
      toast.success(
        link.high_demand ? "Tag removed" : "Tagged as High Demanded"
      );
    } catch (e) {
      toast.error("Could not update");
    }
  };

  return (
    <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-bold text-slate-900">
          <FileText className="h-4 w-4 text-indigo-600" /> Standalone PDFs
          <span className="text-xs font-normal text-slate-400">
            (no folder)
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-600">
            <Eye className="h-3 w-3" />
            {Object.keys(viewCounts)
              .filter((id) => links.some((l) => l.id === id))
              .reduce((sum, id) => sum + viewCounts[id], 0)}{" "}
            views
          </span>
        </h2>
        <Button
          size="sm"
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          <Plus className="mr-1 h-4 w-4" /> Add PDF
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-4">
          <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
        </div>
      ) : links.length === 0 ? (
        <p className="py-4 text-center text-xs text-slate-400">
          No standalone PDFs yet. Add important / most-wanted PDFs here — they
          don't need a folder.
        </p>
      ) : (
        <div className="space-y-2">
          {links.map((link) => (
            <div
              key={link.id}
              className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50 p-2.5"
            >
              <FileText className="h-4 w-4 shrink-0 text-slate-400" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-slate-800">
                  {link.title}
                </p>
                <div className="flex flex-wrap items-center gap-1.5">
                  {link.high_demand && (
                    <span className="inline-flex items-center gap-0.5 rounded-full bg-orange-100 px-1.5 py-0.5 text-[9px] font-bold text-orange-600">
                      <Flame className="h-2.5 w-2.5" /> HIGH DEMANDED
                    </span>
                  )}
                  {link.pinned && (
                    <span className="text-[10px] font-medium text-indigo-600">
                      📌 Pinned to home
                    </span>
                  )}
                  <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-slate-500">
                    <Eye className="h-3 w-3" /> {viewCounts[link.id] || 0} views
                  </span>
                </div>
              </div>
              <button
                onClick={() => toggleHighDemand(link)}
                className={`rounded-lg p-1.5 transition hover:bg-orange-100 ${
                  link.high_demand
                    ? "text-orange-500"
                    : "text-slate-400 hover:text-orange-500"
                }`}
                title={
                  link.high_demand
                    ? 'Remove "High Demanded" tag'
                    : 'Tag as "High Demanded by Students"'
                }
              >
                <Flame className="h-4 w-4" />
              </button>
              <button
                onClick={() => togglePin(link)}
                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-200 hover:text-indigo-600"
                title={link.pinned ? "Unpin from home" : "Pin to home"}
              >
                {link.pinned ? (
                  <PinOff className="h-4 w-4" />
                ) : (
                  <Pin className="h-4 w-4" />
                )}
              </button>
              <button
                onClick={() => {
                  setEditing(link);
                  setFormOpen(true);
                }}
                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-200 hover:text-slate-600"
                title="Edit"
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleDelete(link)}
                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-rose-100 hover:text-rose-600"
                title="Delete"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <LinkForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSubmit={handleSubmit}
        editingLink={editing}
      />
    </div>
  );
}