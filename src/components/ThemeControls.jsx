import { Moon, Palette, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { store } from "@/lib/store";

const accents = [
  { id: "blue", label: "Electric blue", color: "#5b91ff" },
  { id: "violet", label: "Ultraviolet", color: "#9b7cff" },
  { id: "cyan", label: "Cyan", color: "#55d8ea" },
  { id: "rose", label: "Rose", color: "#f27ca6" },
];

export default function ThemeControls() {
  const [preferences, setPreferences] = useState(store.snapshot().preferences);
  const [open, setOpen] = useState(false);
  useEffect(() => store.subscribe((next) => setPreferences(next.preferences)), []);
  useEffect(() => {
    document.documentElement.dataset.theme = preferences.theme;
    document.documentElement.dataset.accent = preferences.accent;
  }, [preferences]);
  const toggleTheme = () => store.setPreferences({ theme: preferences.theme === "dark" ? "light" : "dark" });
  return <div className="theme-controls">
    <button className="theme-icon-button" type="button" onClick={toggleTheme} aria-label={`Switch to ${preferences.theme === "dark" ? "light" : "dark"} mode`}>{preferences.theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}</button>
    <button className={`theme-icon-button ${open ? "is-open" : ""}`} type="button" onClick={() => setOpen((value) => !value)} aria-label="Customize theme"><Palette size={17} /></button>
    {open && <div className="theme-popover"><div className="theme-popover-title"><span>Appearance</span><b>{preferences.theme === "dark" ? "Dark" : "Light"}</b></div><div className="theme-mode-row"><button className={preferences.theme === "dark" ? "selected" : ""} onClick={() => store.setPreferences({ theme: "dark" })}><Moon size={14} /> Dark</button><button className={preferences.theme === "light" ? "selected" : ""} onClick={() => store.setPreferences({ theme: "light" })}><Sun size={14} /> Light</button></div><span className="theme-popover-label">Accent color</span><div className="accent-grid">{accents.map((accent) => <button key={accent.id} className={preferences.accent === accent.id ? "selected" : ""} style={{ "--swatch": accent.color }} onClick={() => store.setPreferences({ accent: accent.id })} aria-label={accent.label}><span /></button>)}</div></div>}
  </div>;
}
