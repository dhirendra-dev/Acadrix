import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowUpRight, Bookmark, CheckCircle2, FileText } from "lucide-react";
import { store } from "@/lib/store";
import PdfViewer from "@/components/PdfViewer";
import NotesEditor from "@/components/NotesEditor";

export default function ResourceDetail() {
  const { id } = useParams();
  const resource = store.getResource(id);
  const [, refresh] = useState(0);
  useEffect(() => { if (resource) store.markRecent(resource.id); }, [resource]);
  if (!resource) return <div className="empty-state"><FileText size={26} /><h3>Resource not found</h3><Link className="text-link" to="/resources">Back to library <ArrowUpRight size={14} /></Link></div>;
  const snapshot = store.snapshot();
  const bookmarked = snapshot.bookmarks.includes(resource.id);
  const saveBookmark = () => { store.toggleBookmark(resource.id); refresh((value) => value + 1); };
  return <div className="detail-page">
    <Link to="/resources" className="back-link"><ArrowLeft size={16} /> Back to library</Link>
    <section className={`detail-hero detail-${resource.accent}`}><div className="detail-icon"><FileText size={28} /></div><span className="resource-type">{resource.type}</span><h1>{resource.title}</h1><p>{resource.subject} <i>·</i> {resource.meta}</p><div className="detail-actions"><a className="primary-button" href={resource.pdfUrl} target="_blank" rel="noreferrer">Open PDF <ArrowUpRight size={17} /></a><button className={`quiet-button ${bookmarked ? "is-selected" : ""}`} type="button" onClick={saveBookmark}><Bookmark size={17} fill={bookmarked ? "currentColor" : "none"} /> {bookmarked ? "Saved" : "Save for later"}</button></div></section>
    <div className="study-workspace"><PdfViewer resource={resource} /><NotesEditor resourceId={resource.id} /></div>
    <div className="detail-grid"><div className="surface-panel detail-copy"><span className="eyebrow">Study workflow</span><h2>Read, capture, return.</h2><p>Keep the document open while you write the one formula, doubt, or connection that matters. Your notes and bookmarks are saved on this device.</p><div className="detail-check"><CheckCircle2 size={18} /> Added to your recent activity</div></div><div className="surface-panel detail-meta"><span className="eyebrow">At a glance</span><div><span>Subject</span><strong>{resource.subject}</strong></div><div><span>Format</span><strong>{resource.type}</strong></div><div><span>Availability</span><strong className="available">Ready now</strong></div></div></div>
  </div>;
}
