import React from "react";
import {
  Folder,
  MoreVertical,
  Pencil,
  Trash2,
  Pin,
  PinOff,
  ChevronRight,
  FolderOpen,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

const accentMap = {
  blue: "bg-blue-500",
  green: "bg-emerald-500",
  purple: "bg-violet-500",
  orange: "bg-orange-500",
  rose: "bg-rose-500",
  cyan: "bg-cyan-500",
  amber: "bg-amber-500",
  indigo: "bg-indigo-500",
};

const iconBgMap = {
  blue: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
  green: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
  purple: "bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400",
  orange: "bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400",
  rose: "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400",
  cyan: "bg-cyan-50 text-cyan-600 dark:bg-cyan-500/10 dark:text-cyan-400",
  amber: "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
  indigo: "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400",
};

export default function FolderCard({
  folder,
  count,
  isAdmin,
  onOpen,
  onEdit,
  onDelete,
  onTogglePin,
}) {
  return (
    <div
      onClick={() => onOpen(folder)}
      className={`press-feedback group relative cursor-pointer overflow-hidden rounded-2xl border border-border bg-card shadow-card transition-all hover:-translate-y-0.5 hover:border-foreground/20 hover:shadow-card-hover dark:hover:border-foreground/15 ${folder.pinned ? "sheen" : ""}`}
    >
      {/* Top accent strip */}
      <div className={`h-1 w-full ${accentMap[folder.color] || accentMap.blue}`} />

      <div className="p-5">
        <div className="flex items-start justify-between">
          <div
            className={`flex h-11 w-11 items-center justify-center rounded-xl ${
              iconBgMap[folder.color] || iconBgMap.blue
            }`}
          >
            <Folder className="h-5 w-5" />
          </div>
          <div className="flex items-center gap-1">
            {folder.pinned && (
              <span className="inline-flex items-center gap-1 rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold text-accent-foreground">
                <Pin className="h-2.5 w-2.5" /> PINNED
              </span>
            )}
            {isAdmin && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    onClick={(e) => e.stopPropagation()}
                    className="rounded-lg p-1.5 text-muted-foreground opacity-0 transition hover:bg-secondary hover:text-foreground group-hover:opacity-100"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onTogglePin(folder);
                    }}
                  >
                    {folder.pinned ? (
                      <>
                        <PinOff className="mr-2 h-4 w-4" /> Unpin
                      </>
                    ) : (
                      <>
                        <Pin className="mr-2 h-4 w-4" /> Pin to Home
                      </>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(folder);
                    }}
                  >
                    <Pencil className="mr-2 h-4 w-4" /> Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(folder);
                    }}
                  >
                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        <h3 className="mt-4 text-base font-bold text-foreground">
          {folder.name}
        </h3>
        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
          {folder.description || "No description"}
        </p>

        <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <FolderOpen className="h-3.5 w-3.5" />
            {count} {count === 1 ? "resource" : "resources"}
          </span>
          <ChevronRight className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-primary" />
        </div>
      </div>
    </div>
  );
}