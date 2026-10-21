import React from "react";
import {
  ExternalLink,
  Trash2,
  Pencil,
  FileText,
  Award,
  ClipboardList,
  Video,
  BookOpen,
  Link2,
  MoreVertical,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { openExternal } from "@/lib/openExternal";

const typeMeta = {
  notes: { label: "Notes", icon: FileText, color: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400" },
  pyq: { label: "PYQ", icon: Award, color: "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400" },
  dpp: { label: "DPP", icon: ClipboardList, color: "bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400" },
  video: { label: "Video", icon: Video, color: "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400" },
  book: { label: "Book", icon: BookOpen, color: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400" },
  other: { label: "Other", icon: Link2, color: "bg-secondary text-muted-foreground" },
};

export default function LinkCard({ link, isAdmin, onEdit, onDelete }) {
  const meta = typeMeta[link.resource_type] || typeMeta.other;
  const Icon = meta.icon;
  return (
    <div className="press-feedback group flex items-center gap-4 rounded-xl border border-border bg-card p-4 shadow-card transition hover:border-foreground/20 hover:shadow-card-hover">
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${meta.color}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h4 className="truncate font-semibold text-foreground">{link.title}</h4>
          <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${meta.color}`}>
            {meta.label}
          </span>
        </div>
        {link.description && (
          <p className="truncate text-sm text-muted-foreground">{link.description}</p>
        )}
      </div>
      <div className="flex items-center gap-1">
        <a
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => { openExternal(link.url, e); window.dispatchEvent(new Event("dreamiit:resource-closed")); }}
          className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition hover:bg-primary/90"
        >
          Open <ExternalLink className="h-3 w-3" />
        </a>
        {isAdmin && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-secondary hover:text-foreground">
                <MoreVertical className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(link)}>
                <Pencil className="mr-2 h-4 w-4" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive" onClick={() => onDelete(link)}>
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
}