import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { BookPlus } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function RequestOptionsCard({ onRequest }) {
  const [replyCount, setReplyCount] = useState(0);

  const loadReplyCount = async () => {
    const did = localStorage.getItem("dreamiit_device_id");
    if (!did) return;
    try {
      const data = await base44.entities.ResourceRequest.filter(
        { device_id: did },
        "-created_date",
        50
      );
      const arr = Array.isArray(data) ? data : [];
      setReplyCount(
        arr.filter(
          (r) =>
            r.status === "fulfilled" ||
            r.status === "already_available" ||
            r.status === "other"
        ).length
      );
    } catch {
      /* ignore */
    }
  };

  useEffect(() => {
    loadReplyCount();
  }, []);

  return (
    <div>
      <h2 className="section-eyebrow mb-4">Need something specific?</h2>
      <div className="rounded-2xl border border-border bg-card p-5 shadow-card sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground">
              <BookPlus className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">
                Request a resource
              </h3>
              <p className="mt-0.5 max-w-md text-sm text-muted-foreground">
                If you need any JEE resource we haven't added yet, request it
                here and our admin will add the PDF soon.
              </p>
            </div>
          </div>
          <Button onClick={onRequest} className="relative shrink-0">
            <BookPlus className="h-4 w-4" /> Request
            {replyCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground shadow">
                {replyCount}
              </span>
            )}
          </Button>
        </div>
        {replyCount > 0 && (
          <p className="mt-3 text-xs font-medium text-primary">
            You have {replyCount} admin {replyCount === 1 ? "reply" : "replies"} —
            tap Request to view.
          </p>
        )}
      </div>
    </div>
  );
}