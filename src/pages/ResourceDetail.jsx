import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowUpRight, Bookmark, CheckCircle2, FileText } from "lucide-react";
import { store } from "@/lib/store";

export default function ResourceDetail() {
  const { id } = useParams();
  const resource = store.getResource(id);
  if (!resource) return <div className="empty-state"><FileText size={26} /><h3>Resource not found</h3><Link className="text-link" to="/resources">Back to library <ArrowUpRight size={14} /></Link></div>;
  const snapshot = store.snapshot();
  const bookmarked = snapshot.bookmarks.includes(resource.id);
  store.markRecent(resource.id);
  return <div className="detail-page"><Link to="/resources" className="back-link"><ArrowLeft size={16} /> Back to library</Link><section className={`detail-hero detail-${resource.accent}`}><div className="detail-icon"><FileText size={28} /></div><span className="resource-type">{resource.type}</span><h1>{resource.title}</h1><p>{resource.subject} <i>·</i> {resource.meta}</p><div className="detail-actions"><button className="primary-button" type="button" onClick={() => store.markRecent(resource.id)}>Open resource <ArrowUpRight size={17} /></button><button className={`quiet-button ${bookmarked ? "is-selected" : ""}`} type="button" onClick={() => store.toggleBookmark(resource.id)}><Bookmark size={17} fill={bookmarked ? "currentColor" : "none"} /> {bookmarked ? "Saved" : "Save for later"}</button></div></section><div className="detail-grid"><div className="surface-panel detail-copy"><span className="eyebrow">Study note</span><h2>Make this your next win.</h2><p>This resource is ready in your local Acadrix library. Open it when you’re ready, then mark the next topic before you lose the thread.</p><div className="detail-check"><CheckCircle2 size={18} /> Added to your recent activity</div></div><div className="surface-panel detail-meta"><span className="eyebrow">At a glance</span><div><span>Subject</span><strong>{resource.subject}</strong></div><div><span>Format</span><strong>{resource.type}</strong></div><div><span>Availability</span><strong className="available">Ready now</strong></div></div></div></div>;
}
