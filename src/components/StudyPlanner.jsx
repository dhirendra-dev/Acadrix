import { Check, ListChecks, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { store } from "@/lib/store";

export default function StudyPlanner() {
  const [tasks, setTasks] = useState(store.snapshot().planner.tasks);
  const [draft, setDraft] = useState("");
  useEffect(() => store.subscribe((next) => setTasks(next.planner.tasks)), []);
  const completed = tasks.filter((task) => task.done).length;
  const add = (event) => { event.preventDefault(); if (!draft.trim()) return; store.addTask(draft); setDraft(""); };
  return <section className="study-planner surface-panel"><div className="section-heading"><div><span className="eyebrow"><ListChecks size={13} /> Daily plan</span><h2>Small wins queue</h2></div><span className="planner-count">{completed}/{tasks.length} done</span></div><div className="planner-list">{tasks.map((task) => <div className={`planner-task ${task.done ? "is-done" : ""}`} key={task.id}><button type="button" className="task-check" onClick={() => store.toggleTask(task.id)} aria-label={task.done ? "Mark task incomplete" : "Mark task complete"}>{task.done ? <Check size={14} /> : null}</button><span>{task.title}</span><button type="button" className="task-delete" onClick={() => store.removeTask(task.id)} aria-label="Delete task"><Trash2 size={13} /></button></div>)}</div><form className="planner-add" onSubmit={add}><input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Add a study task..." aria-label="Add a study task" /><button type="submit" aria-label="Add task"><Plus size={16} /></button></form></section>;
}
