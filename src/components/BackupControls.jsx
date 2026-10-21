import { Download, RotateCcw, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { store } from "@/lib/store";

export default function BackupControls() {
  const inputRef = useRef(null);
  const [message, setMessage] = useState("");
  const download = () => { const blob = new Blob([store.exportBackup()], { type: "application/json" }); const url = URL.createObjectURL(blob); const link = document.createElement("a"); link.href = url; link.download = `acadrix-backup-${new Date().toISOString().slice(0, 10)}.json`; link.click(); URL.revokeObjectURL(url); setMessage("Backup downloaded to this device."); };
  const importFile = async (event) => { const file = event.target.files?.[0]; if (!file) return; try { store.importBackup(await file.text()); setMessage("Backup restored successfully."); } catch { setMessage("That file is not a valid Acadrix backup."); } event.target.value = ""; };
  return <div className="backup-controls"><div><span className="eyebrow"><RotateCcw size={13} /> Your data, portable</span><h2>Back up your workspace</h2><p>Export bookmarks, notes, progress, planner tasks, themes, and tracker sessions as a local JSON file. Nothing is uploaded.</p></div><div className="backup-actions"><button type="button" onClick={download}><Download size={15} /> Export backup</button><button type="button" onClick={() => inputRef.current?.click()}><Upload size={15} /> Import backup</button><input ref={inputRef} type="file" accept="application/json,.json" onChange={importFile} hidden /></div>{message && <span className="backup-message">{message}</span>}</div>;
}
