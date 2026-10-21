import { Pause, Play, RotateCcw, TimerReset } from "lucide-react";
import { useEffect, useState } from "react";
import { store } from "@/lib/store";

const presets = [25, 50, 90];
const formatTime = (seconds) => `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;

export default function FocusTimer() {
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [completed, setCompleted] = useState(false);
  useEffect(() => {
    if (!running) return undefined;
    const timer = window.setInterval(() => setSeconds((remaining) => {
      if (remaining <= 1) { window.clearInterval(timer); setRunning(false); setCompleted(true); store.logStudySession(minutes); return 0; }
      return remaining - 1;
    }), 1000);
    return () => window.clearInterval(timer);
  }, [running, minutes]);
  const selectPreset = (value) => { setMinutes(value); setSeconds(value * 60); setRunning(false); setCompleted(false); };
  const reset = () => { setSeconds(minutes * 60); setRunning(false); setCompleted(false); };
  return <section className="focus-timer surface-panel"><div className="section-heading"><div><span className="eyebrow"><TimerReset size={13} /> Focus room</span><h2>Deep work timer</h2></div><span className="timer-status">{completed ? "Session logged" : running ? "Focus mode" : "Ready"}</span></div><div className="timer-display"><strong>{formatTime(seconds)}</strong><span>{completed ? "Great work. Take a short break." : "Keep this tab open while you study."}</span></div><div className="timer-presets">{presets.map((value) => <button type="button" key={value} className={minutes === value ? "is-active" : ""} onClick={() => selectPreset(value)}>{value} min</button>)}</div><div className="timer-controls"><button type="button" className="timer-primary" onClick={() => { setCompleted(false); setRunning((value) => !value); }}>{running ? <><Pause size={15} /> Pause</> : <><Play size={15} /> Start focus</>}</button><button type="button" className="timer-reset" onClick={reset} aria-label="Reset timer"><RotateCcw size={15} /></button></div></section>;
}
