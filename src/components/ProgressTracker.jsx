import { CheckCircle2, Circle } from "lucide-react";
import { useEffect, useState } from "react";
import { store } from "@/lib/store";

const levels = [0, 25, 50, 75, 100];

export default function ProgressTracker({ resourceId }) {
  const [progress, setProgress] = useState(store.getProgress(resourceId));
  useEffect(() => store.subscribe((next) => setProgress(next.progress[resourceId] || 0)), [resourceId]);
  const update = (value) => { store.setProgress(resourceId, value); setProgress(value); };
  return <section className="progress-tracker surface-panel"><div className="progress-tracker-heading"><div><span className="eyebrow">Study progress</span><h2>{progress === 100 ? "Completed" : progress > 0 ? "Keep the momentum" : "Ready when you are"}</h2></div><strong>{progress}%</strong></div><div className="large-progress-track"><span style={{ width: `${progress}%` }} /></div><div className="progress-levels">{levels.map((level) => <button key={level} type="button" className={progress === level ? "is-active" : ""} onClick={() => update(level)}>{level === 100 ? (progress === 100 ? <CheckCircle2 size={14} /> : <CheckCircle2 size={14} />) : progress >= level && level > 0 ? <CheckCircle2 size={14} /> : <Circle size={14} />}<span>{level === 0 ? "Not started" : level === 100 ? "Complete" : `${level}%`}</span></button>)}</div></section>;
}
