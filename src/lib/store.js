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
  progress: { "res-1": 35, "res-3": 60, "res-5": 80 },
  tracker: { dailyGoal: 60, sessions: [] },
  planner: { tasks: [
    { id: "task-1", title: "Review one bookmarked resource", done: false },
    { id: "task-2", title: "Solve 10 practice questions", done: false },
    { id: "task-3", title: "Write one takeaway in your notes", done: false },
  ] },
  preferences: { theme: "dark", accent: "blue" },
};

function readState() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const parsed = stored ? JSON.parse(stored) : {};
    const baseResources = parsed.resources || seedState.resources;
    const existingIds = new Set(baseResources.map((resource) => resource.id));
    const resources = [...baseResources, ...studyCatalog.filter((resource) => !existingIds.has(resource.id))];
    return { ...seedState, ...parsed, resources, notes: { ...seedState.notes, ...(parsed.notes || {}) }, progress: { ...seedState.progress, ...(parsed.progress || {}) }, tracker: { ...seedState.tracker, ...(parsed.tracker || {}), sessions: parsed.tracker?.sessions || seedState.tracker.sessions }, planner: { ...seedState.planner, ...(parsed.planner || {}), tasks: parsed.planner?.tasks || seedState.planner.tasks }, preferences: { ...seedState.preferences, ...(parsed.preferences || {}) } };
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
  getProgress: (id) => state.progress[id] || 0,
  setProgress: (id, value) => { const progress = Math.max(0, Math.min(100, Number(value) || 0)); state = { ...state, progress: { ...state.progress, [id]: progress } }; emit(); },
  getTrackerSummary: () => {
    const sessions = state.tracker.sessions || [];
    const now = new Date();
    const today = now.toISOString().slice(0, 10);
    const monday = new Date(now);
    const day = monday.getDay() || 7;
    monday.setDate(monday.getDate() - day + 1); monday.setHours(0, 0, 0, 0);
    const weekStart = monday.getTime();
    const todaySessions = sessions.filter((session) => session.date.slice(0, 10) === today);
    const weekSessions = sessions.filter((session) => new Date(session.date).getTime() >= weekStart);
    return { dailyGoal: state.tracker.dailyGoal, todayMinutes: todaySessions.reduce((sum, session) => sum + session.minutes, 0), weeklyMinutes: weekSessions.reduce((sum, session) => sum + session.minutes, 0), todaySessions: todaySessions.length, weekSessions: weekSessions.length, recentSessions: sessions.slice(-5).reverse() };
  },
  logStudySession: (minutes) => { const value = Math.max(1, Math.min(480, Number(minutes) || 0)); const session = { id: `session-${Date.now()}`, date: new Date().toISOString(), minutes: value }; state = { ...state, tracker: { ...state.tracker, sessions: [...(state.tracker.sessions || []), session].slice(-500) } }; emit(); },
  getProductivitySummary: () => {
    const sessions = state.tracker.sessions || [];
    const now = new Date();
    const keyFor = (date) => new Date(date).toISOString().slice(0, 10);
    const todayKey = keyFor(now);
    const dates = new Set(sessions.map((session) => keyFor(session.date)));
    let streak = 0;
    const cursor = new Date(now); cursor.setHours(0, 0, 0, 0);
    if (!dates.has(todayKey)) cursor.setDate(cursor.getDate() - 1);
    while (dates.has(keyFor(cursor))) { streak += 1; cursor.setDate(cursor.getDate() - 1); }
    const weekDays = Array.from({ length: 7 }, (_, index) => { const date = new Date(now); date.setHours(0, 0, 0, 0); date.setDate(date.getDate() - (6 - index)); const key = keyFor(date); return { key, label: date.toLocaleDateString(undefined, { weekday: "short" }).slice(0, 2), minutes: sessions.filter((session) => keyFor(session.date) === key).reduce((sum, session) => sum + session.minutes, 0) }; });
    const totalMinutes = sessions.reduce((sum, session) => sum + session.minutes, 0);
    return { streak, weekDays, totalMinutes, totalSessions: sessions.length, achievements: [streak >= 1, sessions.length >= 5, totalMinutes >= 300, streak >= 7].filter(Boolean).length };
  },
  setDailyGoal: (minutes) => { const dailyGoal = Math.max(15, Math.min(480, Number(minutes) || 60)); state = { ...state, tracker: { ...state.tracker, dailyGoal } }; emit(); },
  addTask: (title) => { const cleanTitle = String(title || "").trim(); if (!cleanTitle) return; state = { ...state, planner: { ...state.planner, tasks: [...state.planner.tasks, { id: `task-${Date.now()}`, title: cleanTitle, done: false }] } }; emit(); },
  toggleTask: (id) => { state = { ...state, planner: { ...state.planner, tasks: state.planner.tasks.map((task) => task.id === id ? { ...task, done: !task.done } : task) } }; emit(); },
  removeTask: (id) => { state = { ...state, planner: { ...state.planner, tasks: state.planner.tasks.filter((task) => task.id !== id) } }; emit(); },
  exportBackup: () => JSON.stringify({ app: "Acadrix", version: 1, exportedAt: new Date().toISOString(), state }),
  importBackup: (payload) => { const incoming = typeof payload === "string" ? JSON.parse(payload) : payload; if (!incoming || incoming.app !== "Acadrix" || !incoming.state) throw new Error("Invalid Acadrix backup"); state = { ...seedState, ...incoming.state, notes: { ...seedState.notes, ...(incoming.state.notes || {}) }, progress: { ...seedState.progress, ...(incoming.state.progress || {}) }, preferences: { ...seedState.preferences, ...(incoming.state.preferences || {}) }, tracker: { ...seedState.tracker, ...(incoming.state.tracker || {}) }, planner: { ...seedState.planner, ...(incoming.state.planner || {}) } }; emit(); },
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
