import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Star, Loader2, BarChart3 } from "lucide-react";

export default function AdminRatings() {
  const [loading, setLoading] = useState(true);
  const [feedbacks, setFeedbacks] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await base44.entities.Feedback.list("-created_date", 1000);
        setFeedbacks(Array.isArray(data) ? data : []);
      } catch {
        /* ignore */
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="mb-6 flex justify-center rounded-2xl border border-slate-200 bg-white p-6">
        <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
      </div>
    );
  }

  const total = feedbacks.length;
  const avg =
    total > 0
      ? (
          feedbacks.reduce((s, f) => s + (f.rating || 0), 0) / total
        ).toFixed(1)
      : "0.0";
  const dist = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: feedbacks.filter((f) => f.rating === star).length,
  }));
  const maxDist = Math.max(...dist.map((d) => d.count), 1);

  return (
    <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4">
      <h2 className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-900">
        <BarChart3 className="h-4 w-4 text-amber-500" /> User Ratings
      </h2>

      {total === 0 ? (
        <p className="py-4 text-center text-xs text-slate-400">
          No ratings yet
        </p>
      ) : (
        <>
          <div className="mb-4 flex items-center gap-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-slate-800">{avg}</p>
              <div className="mt-0.5 flex justify-center">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`h-3.5 w-3.5 ${
                      s <= Math.round(parseFloat(avg))
                        ? "fill-amber-400 text-amber-400"
                        : "fill-slate-100 text-slate-300"
                    }`}
                  />
                ))}
              </div>
              <p className="mt-0.5 text-[10px] text-slate-500">{total} rating{total !== 1 ? "s" : ""}</p>
            </div>
            <div className="flex-1 space-y-1">
              {dist.map((d) => (
                <div key={d.star} className="flex items-center gap-2">
                  <span className="flex w-6 items-center gap-0.5 text-[10px] font-medium text-slate-500">
                    {d.star}
                    <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />
                  </span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full rounded-full bg-amber-400"
                      style={{ width: `${(d.count / maxDist) * 100}%` }}
                    />
                  </div>
                  <span className="w-6 text-right text-[10px] font-bold text-slate-700">
                    {d.count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <h3 className="mb-2 text-xs font-bold text-slate-600">All Ratings ({total})</h3>
          <div className="max-h-[420px] space-y-2 overflow-y-auto pr-1">
            {feedbacks.map((f) => (
              <div
                key={f.id}
                className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50 p-2.5"
              >
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`h-3.5 w-3.5 ${
                        s <= (f.rating || 0)
                          ? "fill-amber-400 text-amber-400"
                          : "fill-slate-200 text-slate-300"
                      }`}
                    />
                  ))}
                </div>
                <p className="min-w-0 flex-1 truncate text-xs text-slate-600">
                  {f.message || "—"}
                </p>
                <span className="shrink-0 text-[10px] text-slate-400">
                  {f.category || "other"}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}