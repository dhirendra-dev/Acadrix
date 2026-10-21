import { base44 } from "@/api/base44Client";

/**
 * Fetches ALL AppSession records by paginating in batches of 500
 * (the list() method caps at 500 per call).
 * Dedupes by id to guard against boundary ties on last_active.
 */
export async function fetchAllSessions() {
  const all = [];
  const seenIds = new Set();
  let cursor = null;
  for (let i = 0; i < 50; i++) {
    try {
      const batch = cursor
        ? await base44.entities.AppSession.filter(
            { last_active: { $lt: cursor } },
            "-last_active",
            500
          )
        : await base44.entities.AppSession.list("-last_active", 500);
      if (!Array.isArray(batch) || batch.length === 0) break;
      batch.forEach((s) => {
        if (!seenIds.has(s.id)) {
          seenIds.add(s.id);
          all.push(s);
        }
      });
      if (batch.length < 500) break;
      cursor = batch[batch.length - 1].last_active;
    } catch (e) {
      console.error("fetchAllSessions: batch failed, returning partial data", e);
      break;
    }
  }
  return all;
}

/**
 * Fetches ALL ResourceView records by paginating in batches of 500
 * (the list() method caps at 500 per call).
 * Dedupes by id to guard against boundary ties on created_date.
 */
export async function fetchAllViews() {
  const all = [];
  const seenIds = new Set();
  let cursor = null;
  for (let i = 0; i < 50; i++) {
    try {
      const batch = cursor
        ? await base44.entities.ResourceView.filter(
            { created_date: { $lt: cursor } },
            "-created_date",
            500
          )
        : await base44.entities.ResourceView.list("-created_date", 500);
      if (!Array.isArray(batch) || batch.length === 0) break;
      batch.forEach((v) => {
        if (!seenIds.has(v.id)) {
          seenIds.add(v.id);
          all.push(v);
        }
      });
      if (batch.length < 500) break;
      cursor = batch[batch.length - 1].created_date;
    } catch (e) {
      console.error("fetchAllViews: batch failed, returning partial data", e);
      break;
    }
  }
  return all;
}