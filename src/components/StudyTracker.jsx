import { CheckCircle2, Clock3, Flame, Goal, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { store } from "@/lib/store";

const sessionOptions = [15, 30, 60];

export default function StudyTracker() {
  const [summary, setSummary] = useState(store.getTrackerSummary());
  const [goal, setGoal] = useState(store.snapshot().tracker.dailyGoal);
  useEffect(() => store.subscribe((next) => { setSummary(store.getTrackerSummary()); setGoal(next.tracker.dailyGoal); }), []);
  const percent = Math.min(100, Math.round((summary.todayMinutes / summary.dailyGoal) * 100));
  return <section className="tracker-panel surface-panel"><div className="tracker-main"><div className="section-heading"><div><span className="eyebrow"><Goal size={13} /> Local study tracker</span><h2>Make today count</h2></div><div className="tracker-streak"><Flame size={15} /> {summary.weekSessions} sessions this week</div></div><div className="tracker-progress-row"><div className="tracker-ring" style={{ "--progress": `${percent}%` }}><strong>{percent}%</strong><span>today</span></div><div className="tracker-copy"><strong>{summary.todayMinutes} <small>/ {summary.dailyGoal} min</small></strong><span>{percent >= 100 ? "Daily goal complete. Protect the momentum." : `${summary.dailyGoal - summary.todayMinutes} minutes left in today's goal.`}</span><div className="large-progress-track"><span style={{ width: `${percent}%` }} /></div></div></div><div className="tracker-actions"><span>Log a focused session</span>{sessionOptions.map((minutes) => <button key={minutes} type="button" onClick={() => store.logStudySession(minutes)}><Plus size={13} /> {minutes} min</button>)}</div></div><div className="tracker-side"><span className="eyebrow">Weekly total</span><strong>{summary.weeklyMinutes}<small> min</small></strong><span className="tracker-side-note"><CheckCircle2 size={13} /> Saved only on this device</span><label htmlFor="daily-goal">Daily goal</label><select id="daily-goal" value={goal} onChange={(event) => store.setDailyGoal(event.target.value)}>{[30, 60, 90, 120, 180].map((value) => <option key={value} value={value}>{value} minutes</option>)}</select><span className="tracker-last"><Clock3 size={12} /> {summary.todaySessions} session{summary.todaySessions === 1 ? "" : "s"} today</span></div></section>;
}
