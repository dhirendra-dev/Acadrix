import { Link } from "react-router-dom";
import { ArrowUpRight, Bookmark, ChevronRight, Clock3, FolderOpen, Layers3, Plus, Sparkles, Target, TrendingUp } from "lucide-react";
import { store } from "@/lib/store";

const statCards = [
  { label: "Library depth", value: "73", suffix: "resources", icon: Layers3, tone: "blue" },
  { label: "Study streak", value: "12", suffix: "days", icon: TrendingUp, tone: "violet" },
  { label: "Saved for later", value: "02", suffix: "bookmarks", icon: Bookmark, tone: "cyan" },
];

export default function Home() {
  const snapshot = store.snapshot();
  const recent = snapshot.recent.map((id) => store.getResource(id)).filter(Boolean);
  return <div className="dashboard-page">
    <section className="hero-panel">
      <div className="hero-copy"><span className="eyebrow"><Sparkles size={13} /> Focus mode enabled</span><h1>Your next focused<br /><em>session starts here.</em></h1><p>Everything you need to move from “I should study” to the exact resource in front of you.</p><div className="hero-actions"><Link className="primary-button" to="/resources">Open resource library <ArrowUpRight size={17} /></Link><Link className="quiet-button" to="/requests"><Plus size={17} /> Request a resource</Link></div></div>
      <div className="hero-orbit"><div className="orbit orbit-one" /><div className="orbit orbit-two" /><div className="orbit-core"><img src="/brand/acadrix-logo.png" alt="Acadrix" /></div><span className="orbit-tag tag-top">JEE / 2026</span><span className="orbit-tag tag-bottom">Study smarter</span></div>
      <div className="hero-footer"><span><span className="live-pulse" /> Workspace ready</span><span>Last synced locally just now</span></div>
    </section>
    <section className="stats-grid">{statCards.map(({ label, value, suffix, icon: Icon, tone }) => <div className={`stat-card tone-${tone}`} key={label}><div className="stat-icon"><Icon size={18} /></div><div><span>{label}</span><strong>{value}<small>{suffix}</small></strong></div><ChevronRight size={16} className="stat-arrow" /></div>)}</section>
    <div className="content-grid">
      <section className="surface-panel recent-panel"><div className="section-heading"><div><span className="eyebrow">Continue where you left off</span><h2>Recent resources</h2></div><Link to="/resources" className="text-link">View all <ArrowUpRight size={14} /></Link></div>{recent.map((resource) => <Link to={`/resource/${resource.id}`} className="recent-row" key={resource.id}><div className={`resource-glyph glyph-${resource.accent}`}><BookIcon type={resource.type} /></div><div className="row-copy"><strong>{resource.title}</strong><span>{resource.subject} <i>·</i> {resource.meta}</span></div><div className="row-time"><Clock3 size={14} /> Active</div><ChevronRight size={16} /></Link>)}</section>
      <section className="surface-panel focus-panel"><div className="section-heading"><div><span className="eyebrow">Your focus map</span><h2>By subject</h2></div><Target size={19} className="heading-icon" /></div>{snapshot.folders.map((folder) => <Link to="/resources" className="subject-row" key={folder.id}><div className={`subject-mark mark-${folder.color}`}>{folder.name[0]}</div><div className="subject-copy"><strong>{folder.name}</strong><span>{folder.count} resources</span></div><div className="progress-track"><span style={{ width: `${folder.progress}%` }} /></div><b>{folder.progress}%</b></Link>)}</section>
    </div>
    <section className="tip-banner"><div className="tip-mark"><FolderOpen size={18} /></div><div><span className="eyebrow">A better study habit</span><strong>Build a short queue before you start.</strong><p>Pick one note, one practice set, and one quick revision deck. Less searching, more momentum.</p></div><Link to="/resources" className="text-link">Build queue <ArrowUpRight size={14} /></Link></section>
  </div>;
}

function BookIcon({ type }) { return <span className="book-icon">{type === "Practice set" ? "✦" : type === "Notes" ? "N" : "R"}</span>; }
