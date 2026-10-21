import { Award, Flame, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { store } from "@/lib/store";

export default function ProductivityWidget() {
  const [summary, setSummary] = useState(store.getProductivitySummary());
  useEffect(() => store.subscribe(() => setSummary(store.getProductivitySummary())), []);
  const maxMinutes = Math.max(60, ...summary.weekDays.map((day) => day.minutes));
  return <section className="productivity-widget surface-panel"><div className="section-heading"><div><span className="eyebrow"><TrendingUp size={13} /> Productivity</span><h2>Your rhythm</h2></div><span className="productivity-award"><Award size={14} /> {summary.achievements}/4</span></div><div className="productivity-metrics"><div><Flame size={17} /><strong>{summary.streak}</strong><span>day streak</span></div><div><strong>{summary.totalSessions}</strong><span>sessions</span></div><div><strong>{summary.totalMinutes}</strong><span>minutes logged</span></div></div><div className="week-chart" aria-label="Study minutes over the last seven days">{summary.weekDays.map((day) => <div className="week-bar" key={day.key}><span className="week-bar-fill" style={{ height: `${Math.max(day.minutes ? 12 : 3, (day.minutes / maxMinutes) * 100)}%` }} title={`${day.minutes} minutes`} /><small>{day.label}</small></div>)}</div><div className="achievement-row"><span className={summary.achievements >= 1 ? "is-earned" : ""}>First session</span><span className={summary.achievements >= 2 ? "is-earned" : ""}>5 sessions</span><span className={summary.achievements >= 3 ? "is-earned" : ""}>5 hours</span><span className={summary.achievements >= 4 ? "is-earned" : ""}>7 day streak</span></div></section>;
}
