import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Bookmark, CheckCircle2, ChevronRight, Clock3, FolderOpen, Layers3, Sparkles, Target, TrendingUp } from "lucide-react";
import { store } from "@/lib/store";
import StudyTracker from "@/components/StudyTracker";
import FocusTimer from "@/components/FocusTimer";
import StudyPlanner from "@/components/StudyPlanner";

export default function Home() {
  const [, refresh] = useState(0);
  useEffect(() => store.subscribe(() => refresh((value) => value + 1)), []);
  const snapshot = store.snapshot();
  const resources = snapshot.resources;
  const progressValues = resources.map((resource) => store.getProgress(resource.id));
  const overall = progressValues.length ? Math.round(progressValues.reduce((sum, value) => sum + value, 0) / progressValues.length) : 0;
  const completed = progressValues.filter((value) => value === 100).length;
  const recent = snapshot.recent.map((id) => store.getResource(id)).filter(Boolean);
  const favorites = snapshot.bookmarks.map((id) => store.getResource(id)).filter(Boolean);
  const statCards = [
    { label: "Library depth", value: resources.length, suffix: "resources", icon: Layers3, tone: "blue" },
    { label: "Overall progress", value: `${overall}%`, suffix: "complete", icon: TrendingUp, tone: "violet" },
    { label: "Completed", value: completed, suffix: "resources", icon: CheckCircle2, tone: "green" },
    { label: "Saved for later", value: snapshot.bookmarks.length, suffix: "favorites", icon: Bookmark, tone: "cyan" },
  ];
  return <div className="dashboard-page">
    <section className="hero-panel"><div className="hero-copy"><span className="eyebrow"><Sparkles size={13} /> Your study dashboard</span><h1>Make progress you<br /><em>can see every day.</em></h1><p>Track the resources you have started, keep your favorites close, and turn every focused session into visible momentum.</p><div className="hero-actions"><Link className="primary-button" to="/resources">Open resource library <ArrowUpRight size={17} /></Link><Link className="quiet-button" to="#favorites"><Bookmark size={17} /> View favorites</Link></div></div><div className="hero-orbit"><div className="orbit orbit-one" /><div className="orbit orbit-two" /><div className="orbit-core"><img src="/brand/acadrix-logo.png" alt="Acadrix" /></div><span className="orbit-tag tag-top">{overall}% complete</span><span className="orbit-tag tag-bottom">Keep going</span></div><div className="hero-footer"><span><span className="live-pulse" /> Progress saved locally</span><span>{completed} completed · {snapshot.bookmarks.length} favorites</span></div></section>
    <section className="stats-grid">{statCards.map(({ label, value, suffix, icon: Icon, tone }) => <div className={`stat-card tone-${tone}`} key={label}><div className="stat-icon"><Icon size={18} /></div><div><span>{label}</span><strong>{value}<small>{suffix}</small></strong></div><ChevronRight size={16} className="stat-arrow" /></div>)}</section>
    <StudyTracker />
    <div className="offline-tools-grid"><FocusTimer /><StudyPlanner /></div>
    <div className="content-grid"><section className="surface-panel recent-panel"><div className="section-heading"><div><span className="eyebrow">Continue where you left off</span><h2>Recent resources</h2></div><Link to="/resources" className="text-link">View all <ArrowUpRight size={14} /></Link></div>{recent.map((resource) => <Link to={`/resource/${resource.id}`} className="recent-row" key={resource.id}><div className={`resource-glyph glyph-${resource.accent}`}><BookIcon type={resource.type} /></div><div className="row-copy"><strong>{resource.title}</strong><span>{resource.subject} <i>·</i> {resource.meta}</span><div className="row-progress"><span style={{ width: `${store.getProgress(resource.id)}%` }} /></div></div><div className="row-time"><Clock3 size={14} /> {store.getProgress(resource.id)}%</div><ChevronRight size={16} /></Link>)}</section><section className="surface-panel focus-panel"><div className="section-heading"><div><span className="eyebrow">Your focus map</span><h2>By subject</h2></div><Target size={19} className="heading-icon" /></div>{snapshot.folders.map((folder) => { const subjectResources = resources.filter((resource) => resource.subject === folder.name); const subjectProgress = subjectResources.length ? Math.round(subjectResources.reduce((sum, resource) => sum + store.getProgress(resource.id), 0) / subjectResources.length) : 0; return <Link to={`/resources?subject=${folder.name}`} className="subject-row" key={folder.id}><div className={`subject-mark mark-${folder.color}`}>{folder.name[0]}</div><div className="subject-copy"><strong>{folder.name}</strong><span>{subjectResources.length} resources</span></div><div className="progress-track"><span style={{ width: `${subjectProgress}%` }} /></div><b>{subjectProgress}%</b></Link>; })}</section></div>
    <section className="surface-panel favorites-panel" id="favorites"><div className="section-heading"><div><span className="eyebrow"><Bookmark size={13} /> Your collection</span><h2>Favorite resources</h2></div><Link to="/resources" className="text-link">Find more <ArrowUpRight size={14} /></Link></div>{favorites.length ? <div className="favorites-grid">{favorites.map((resource) => <Link to={`/resource/${resource.id}`} className="favorite-card" key={resource.id}><div className={`resource-glyph glyph-${resource.accent}`}><Bookmark size={17} fill="currentColor" /></div><div className="favorite-copy"><strong>{resource.title}</strong><span>{resource.subject} · {store.getProgress(resource.id)}% complete</span><div className="mini-progress"><span style={{ width: `${store.getProgress(resource.id)}%` }} /></div></div><ChevronRight size={16} /></Link>)}</div> : <div className="favorite-empty"><Bookmark size={20} /><div><strong>No favorites yet</strong><span>Bookmark resources from your library to build a personal study queue.</span></div><Link className="text-link" to="/resources">Browse library <ArrowUpRight size={14} /></Link></div>}</section>
    <section className="tip-banner"><div className="tip-mark"><FolderOpen size={18} /></div><div><span className="eyebrow">A better study habit</span><strong>Build a short queue before you start.</strong><p>Pick one note, one practice set, and one quick revision deck. Less searching, more momentum.</p></div><Link to="/resources" className="text-link">Build queue <ArrowUpRight size={14} /></Link></section>
  </div>;
}

function BookIcon({ type }) { return <span className="book-icon">{type === "Practice set" ? "✦" : type === "Notes" ? "N" : "R"}</span>; }
