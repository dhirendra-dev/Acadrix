import React from "react";
import { BookMarked, NotebookPen, FileStack } from "lucide-react";

const POINTS = [
  {
    icon: BookMarked,
    title: "Author Books",
    desc: "HC Verma, DC Pandey, MS Chauhan, VK Jaiswal, Black Book, and more — all in the Author Book section.",
    color: "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400",
  },
  {
    icon: NotebookPen,
    title: "PW Handbook",
    desc: "Eajee handwritten notes are available in the PW Handbook section.",
    color: "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
  },
  {
    icon: FileStack,
    title: "Summary & Practice",
    desc: "Chapter-wise summary notes and practice sheets are also available in the app.",
    color: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
  },
];

export default function FeaturePoints() {
  return (
    <div>
      <h2 className="section-eyebrow mb-4">What you'll find</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {POINTS.map((p, i) => (
          <div
            key={i}
            className="rounded-2xl border border-border bg-card p-4 shadow-card transition hover:shadow-card-hover"
          >
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${p.color}`}>
              <p.icon className="h-5 w-5" />
            </div>
            <h3 className="mt-3 text-sm font-bold text-foreground">{p.title}</h3>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              {p.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}