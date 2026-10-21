import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowUpRight, Bookmark, ChevronRight, FileText, Filter, Folder, Search, SlidersHorizontal } from "lucide-react";
import { store } from "@/lib/store";

export default function Resources() {
  const [query, setQuery] = useState("");
  const [searchParams] = useSearchParams();
  const [active, setActive] = useState(searchParams.get("subject") || "All");
  const [, refresh] = useState(0);
  const snapshot = store.snapshot();
  const subjects = ["All", ...snapshot.folders.map((folder) => folder.name), "Mixed"];
  const resources = useMemo(() => snapshot.resources.filter((resource) => (active === "All" || resource.subject === active) && `${resource.title} ${resource.subject} ${resource.type} ${resource.meta}`.toLowerCase().includes(query.toLowerCase())), [snapshot, active, query]);
  const toggleBookmark = (event, id) => { event.preventDefault(); store.toggleBookmark(id); refresh((value) => value + 1); };
  return <div className="library-page"><div className="page-heading"><div><span className="eyebrow">The knowledge base</span><h1>Resource library</h1><p>Curated material, arranged for the way you actually study.</p></div><div className="heading-count"><strong>{resources.length}</strong><span>visible resources</span></div></div>
    <div className="library-toolbar"><div className="search-field"><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search notes, PYQs, revision..." aria-label="Search resources" /></div><button className="filter-button"><SlidersHorizontal size={16} /> Filters <span>0</span></button></div>
    <div className="filter-tabs" role="tablist">{subjects.map((subject) => <button key={subject} className={active === subject ? "is-active" : ""} onClick={() => setActive(subject)}>{subject}</button>)}</div>
    <div className="folder-strip">{snapshot.folders.map((folder) => <Link to="/resources" className={`folder-mini mini-${folder.color}`} key={folder.id}><div><Folder size={17} /><strong>{folder.name}</strong></div><span>{folder.count} items <ChevronRight size={14} /></span></Link>)}</div>
    <div className="results-heading"><span>{active === "All" ? "All materials" : `${active} materials`}</span><span><Filter size={14} /> Sorted by relevance</span></div>
    <div className="resource-list">{resources.map((resource) => <Link to={`/resource/${resource.id}`} className="resource-card" key={resource.id}><div className={`resource-glyph glyph-${resource.accent}`}><FileText size={19} /></div><div className="resource-card-copy"><span className="resource-type">{resource.type}</span><h3>{resource.title}</h3><p>{resource.subject} <i>·</i> {resource.meta}</p></div><button className={`bookmark-button ${snapshot.bookmarks.includes(resource.id) ? "is-bookmarked" : ""}`} aria-label="Bookmark resource" onClick={(event) => toggleBookmark(event, resource.id)}><Bookmark size={17} fill={snapshot.bookmarks.includes(resource.id) ? "currentColor" : "none"} /></button><ArrowUpRight size={17} className="resource-arrow" /></Link>)}</div>
    {resources.length === 0 && <div className="empty-state"><Search size={26} /><h3>No resources match that search</h3><p>Try a broader subject or a shorter keyword.</p></div>}
  </div>;
}
