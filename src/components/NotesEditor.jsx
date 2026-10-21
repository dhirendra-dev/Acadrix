import { Check, FilePenLine, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { store } from "@/lib/store";

export default function NotesEditor({ resourceId }) {
  const [value, setValue] = useState(() => store.getNote(resourceId));
  const [saved, setSaved] = useState(true);
  useEffect(() => setValue(store.getNote(resourceId)), [resourceId]);
  useEffect(() => {
    setSaved(false);
    const timer = window.setTimeout(() => { store.saveNote(resourceId, value); setSaved(true); }, 500);
    return () => window.clearTimeout(timer);
  }, [value, resourceId]);
  const saveNow = () => { store.saveNote(resourceId, value); setSaved(true); };
  return <section className="study-panel notes-panel"><div className="study-panel-header"><div><span className="eyebrow"><FilePenLine size={13} /> Personal notes</span><h2>Capture the insight</h2></div><span className={`save-status ${saved ? "is-saved" : ""}`}>{saved ? <><Check size={13} /> Saved locally</> : <><Save size={13} /> Saving...</>}</span></div><textarea value={value} onChange={(event) => setValue(event.target.value)} placeholder="Write a formula, a doubt, or the one idea you want to remember..." aria-label="Study notes" /><div className="notes-footer"><span>Notes stay on this device</span><button type="button" onClick={saveNow}><Save size={13} /> Save now</button></div></section>;
}
