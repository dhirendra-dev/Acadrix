import { FastForward, Pause, Play, RotateCcw, TimerReset } from "lucide-react";
import { useEffect, useState } from "react";
import { store } from "@/lib/store";

const presets = [{ focus: 25, short: 5, label: "25 / 5" }, { focus: 50, short: 10, label: "50 / 10" }, { focus: 90, short: 15, label: "90 / 15" }];
const formatTime = (seconds) => `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
const phaseNames = { focus: "Focus", short: "Short break", long: "Long break" };

export default function FocusTimer() {
  const [preset, setPreset] = useState(presets[0]);
  const [phase, setPhase] = useState("focus");
  const [seconds, setSeconds] = useState(presets[0].focus * 60);
  const [running, setRunning] = useState(false);
  const [cycles, setCycles] = useState(0);
  const [completed, setCompleted] = useState(false);
  useEffect(() => {
    if (!running) return undefined;
    const timer = window.setInterval(() => setSeconds((remaining) => {
      if (remaining > 1) return remaining - 1;
      if (phase === "focus") {
        store.logStudySession(preset.focus);
        const nextCycles = cycles + 1;
        setCycles(nextCycles);
        setPhase(nextCycles >= 4 ? "long" : "short");
        setSeconds((nextCycles >= 4 ? 15 : preset.short) * 60);
        setCompleted(true);
      } else {
        setPhase("focus");
        setSeconds(preset.focus * 60);
        if (phase === "long") setCycles(0);
        setCompleted(false);
      }
      setRunning(false);
      return 0;
    }), 1000);
    return () => window.clearInterval(timer);
  }, [running, phase, cycles, preset]);
  const selectPreset = (next) => { setPreset(next); setPhase("focus"); setSeconds(next.focus * 60); setRunning(false); setCycles(0); setCompleted(false); };
  const reset = () => { setPhase("focus"); setSeconds(preset.focus * 60); setRunning(false); setCycles(0); setCompleted(false); };
  const skip = () => { setRunning(false); if (phase === "focus") { setPhase("short"); setSeconds(preset.short * 60); } else { setPhase("focus"); setSeconds(preset.focus * 60); } setCompleted(false); };
  return <section className="focus-timer surface-panel"><div className="section-heading"><div><span className="eyebrow"><TimerReset size={13} /> Pomodoro room</span><h2>{phaseNames[phase]} timer</h2></div><span className={`timer-status timer-status-${phase}`}>{completed ? "Focus logged" : running ? "In session" : "Ready"}</span></div><div className="pomodoro-phase"><span className="pomodoro-phase-dot" /> {phase === "focus" ? `Cycle ${Math.min(cycles + 1, 4)} of 4` : "Recovery time"}</div><div className="timer-display"><strong>{formatTime(seconds)}</strong><span>{phase === "focus" ? "Stay with one subject. Your completed focus block is saved locally." : "Let your mind reset before the next focus block."}</span></div><div className="timer-presets">{presets.map((value) => <button type="button" key={value.focus} className={preset.focus === value.focus ? "is-active" : ""} onClick={() => selectPreset(value)}>{value.label}</button>)}</div><div className="timer-controls"><button type="button" className="timer-primary" onClick={() => { setCompleted(false); setRunning((value) => !value); }}>{running ? <><Pause size={15} /> Pause</> : <><Play size={15} /> Start {phase === "focus" ? "focus" : "break"}</>}</button><button type="button" className="timer-reset" onClick={skip} aria-label="Skip Pomodoro phase"><FastForward size={15} /></button><button type="button" className="timer-reset" onClick={reset} aria-label="Reset Pomodoro"><RotateCcw size={15} /></button></div><p className="pomodoro-hint">After four focus blocks, Acadrix recommends a longer break.</p></section>;
}
