import { useState } from "react";
import { CheckCircle2, Clock3, Inbox, Send, Sparkles } from "lucide-react";
import { store, formatRelative } from "@/lib/store";

export default function ResourceRequests() {
  const [title, setTitle] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [, refresh] = useState(0);
  const requests = store.snapshot().requests;
  const submit = (event) => { event.preventDefault(); if (!title.trim()) return; store.addRequest(title.trim()); setTitle(""); setSubmitted(true); refresh((value) => value + 1); window.setTimeout(() => setSubmitted(false), 2800); };
  return <div className="requests-page"><div className="page-heading"><div><span className="eyebrow"><Inbox size={13} /> Extend your library</span><h1>Request a resource</h1><p>Tell us what would make your next study session easier.</p></div><div className="request-stat"><span>Open requests</span><strong>{requests.length.toString().padStart(2, "0")}</strong></div></div>
    <div className="request-layout"><section className="surface-panel request-form-panel"><div className="request-form-art"><div className="art-orbit" /><Sparkles size={25} /></div><div><span className="eyebrow">New request</span><h2>What are you looking for?</h2><p>Book, chapter notes, previous year questions, a problem set — be specific and we’ll add it to the queue.</p></div><form onSubmit={submit}><label htmlFor="request-title">Resource name</label><div className="request-input"><input id="request-title" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="e.g. Advanced problems on wave optics" /><button type="submit" aria-label="Submit request"><Send size={18} /></button></div><small>Requests are stored on this device. No account required.</small></form>{submitted && <div className="success-note"><CheckCircle2 size={17} /> Added to your request queue</div>}</section>
      <section className="surface-panel queue-panel"><div className="section-heading"><div><span className="eyebrow">Your queue</span><h2>Request history</h2></div><Clock3 size={19} className="heading-icon" /></div>{requests.length === 0 ? <div className="queue-empty"><div><Inbox size={22} /></div><strong>Your queue is clear</strong><span>Requested materials will appear here.</span></div> : <div className="request-list">{requests.map((request) => <div className="request-row" key={request.id}><div className="request-status"><Clock3 size={15} /></div><div><strong>{request.title}</strong><span>Added {formatRelative(request.createdAt)}</span></div><b>{request.status}</b></div>)}</div>}</section></div>
  </div>;
}
