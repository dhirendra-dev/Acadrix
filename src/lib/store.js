import { studyCatalog } from "@/lib/studyCatalog";

const STORAGE_KEY = "acadrix.workspace.v1";

const seedState = {
  folders: [
    { id: "physics", name: "Physics", subtitle: "Mechanics, waves & modern physics", color: "blue", count: 18, progress: 64 },
    { id: "chemistry", name: "Chemistry", subtitle: "Organic, inorganic & physical", color: "violet", count: 24, progress: 48 },
    { id: "mathematics", name: "Mathematics", subtitle: "Algebra, calculus & coordinate geometry", color: "cyan", count: 31, progress: 72 },
  ],
  resources: [
    { id: "res-1", folderId: "physics", title: "Rotational Motion — Complete Notes", type: "Notes", subject: "Physics", meta: "42 pages · Updated today", accent: "blue", pdfUrl: "/demo-acadrix-notes.pdf" },
    { id: "res-2", folderId: "chemistry", title: "Organic Reaction Map", type: "Cheat sheet", subject: "Chemistry", meta: "1 page · High yield", accent: "violet", pdfUrl: "/demo-acadrix-notes.pdf" },
    { id: "res-3", folderId: "mathematics", title: "Definite Integration PYQs", type: "Practice set", subject: "Mathematics", meta: "35 questions · JEE Main", accent: "cyan", pdfUrl: "/demo-acadrix-notes.pdf" },
    { id: "res-4", folderId: "physics", title: "Electrostatics DPP — Set 04", type: "Daily practice", subject: "Physics", meta: "20 questions · 45 min", accent: "blue", pdfUrl: "/demo-acadrix-notes.pdf" },
    { id: "res-5", folderId: "chemistry", title: "Coordination Compounds Revision", type: "Revision", subject: "Chemistry", meta: "16 pages · NCERT aligned", accent: "violet", pdfUrl: "/demo-acadrix-notes.pdf" },
    { id: "res-6", folderId: "mathematics", title: "Conic Sections Formula Deck", type: "Formula deck", subject: "Mathematics", meta: "8 cards · Quick review", accent: "cyan", pdfUrl: "/demo-acadrix-notes.pdf" },
    ...studyCatalog,
  ],
  requests: [],
  recent: ["res-1", "res-3", "res-5"],
  bookmarks: ["res-1", "res-3"],
  notes: {},
  preferences: { theme: "dark", accent: "blue" },
};

function readState() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const parsed = stored ? JSON.parse(stored) : {};
    const baseResources = parsed.resources || seedState.resources;
    const existingIds = new Set(baseResources.map((resource) => resource.id));
    const resources = [...baseResources, ...studyCatalog.filter((resource) => !existingIds.has(resource.id))];
    return { ...seedState, ...parsed, resources, notes: { ...seedState.notes, ...(parsed.notes || {}) }, preferences: { ...seedState.preferences, ...(parsed.preferences || {}) } };
  } catch { return seedState; }
}

let state = readState();
const listeners = new Set();
function emit() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* private mode */ }
  listeners.forEach((listener) => listener(state));
}

export const store = {
  snapshot: () => state,
  subscribe: (listener) => { listeners.add(listener); return () => listeners.delete(listener); },
  resources: () => state.resources,
  folders: () => state.folders,
  getResource: (id) => state.resources.find((resource) => resource.id === id),
  getFolder: (id) => state.folders.find((folder) => folder.id === id),
  getNote: (id) => state.notes[id] || "",
  addRequest: (title) => { state = { ...state, requests: [{ id: `request-${Date.now()}`, title, status: "In review", createdAt: new Date().toISOString() }, ...state.requests] }; emit(); },
  toggleBookmark: (id) => { const bookmarks = state.bookmarks.includes(id) ? state.bookmarks.filter((item) => item !== id) : [id, ...state.bookmarks]; state = { ...state, bookmarks }; emit(); },
  markRecent: (id) => { state = { ...state, recent: [id, ...state.recent.filter((item) => item !== id)].slice(0, 5) }; emit(); },
  saveNote: (id, value) => { state = { ...state, notes: { ...state.notes, [id]: value } }; emit(); },
  setPreferences: (preferences) => { state = { ...state, preferences: { ...state.preferences, ...preferences } }; emit(); },
};

export const formatRelative = (date) => {
  const diff = Math.max(0, Date.now() - new Date(date).getTime());
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return hours < 24 ? `${hours}h ago` : `${Math.floor(hours / 24)}d ago`;
};
