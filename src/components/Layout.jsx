import { NavLink, Outlet, useLocation } from "react-router-dom";
import { BarChart3, BookOpen, CircleHelp, Compass, Inbox, MessageCircle, Search, Settings2 } from "lucide-react";
import { motion } from "framer-motion";
import ThemeControls from "@/components/ThemeControls";

const navItems = [
  { to: "/", label: "Overview", icon: Compass },
  { to: "/resources", label: "Library", icon: BookOpen },
  { to: "/requests", label: "Requests", icon: Inbox },
  { to: "/about", label: "About & policy", icon: CircleHelp },
];

export default function Layout() {
  const location = useLocation();
  return <div className="app-shell">
    <aside className="side-rail">
      <NavLink to="/" className="brand-lockup" aria-label="Acadrix home"><span className="brand-image"><img src="/brand/acadrix-logo.png" alt="" /></span><span><strong>Acadrix</strong><small>Study command center</small></span></NavLink>
      <div className="rail-label">Workspace</div>
      <nav className="rail-nav" aria-label="Primary navigation">{navItems.map(({ to, label, icon: Icon }) => <NavLink key={to} to={to} className={({ isActive }) => `rail-link ${isActive ? "is-active" : ""}`} end={to === "/"}><Icon size={18} /><span>{label}</span></NavLink>)}</nav>
      <div className="rail-label rail-label-lower">Insights</div>
      <button className="rail-link rail-button" type="button"><BarChart3 size={18} /><span>Progress</span><em>Soon</em></button>
      <button className="rail-link rail-button" type="button"><Settings2 size={18} /><span>Preferences</span></button>
      <a className="channel-rail-link" href="https://whatsapp.com/channel/0029VbEQ8cL1noz6gXhLXT3c" target="_blank" rel="noreferrer"><MessageCircle size={16} /><span><strong>WhatsApp channel</strong><small>Updates by Dhirendra Kumar</small></span></a><div className="rail-footer"><div className="status-dot" /><div><strong>Local workspace</strong><span>No account or cloud sync</span></div></div>
    </aside>
    <main className="main-stage">
      <header className="topbar">
        <div className="mobile-brand"><img src="/brand/acadrix-logo.png" alt="Acadrix" /><strong>Acadrix</strong></div>
        <div className="breadcrumbs"><span>Workspace</span><b>/</b><strong>{location.pathname === "/" ? "Overview" : location.pathname.slice(1).replace("/", " · ")}</strong></div>
        <div className="topbar-actions"><button className="icon-button" aria-label="Search"><Search size={18} /></button><ThemeControls /></div>
      </header>
      <motion.div key={location.pathname} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .24, ease: "easeOut" }} className="page-frame"><Outlet /></motion.div>
    </main>
    <nav className="mobile-nav" aria-label="Mobile navigation">{navItems.map(({ to, label, icon: Icon }) => <NavLink key={to} to={to} className={({ isActive }) => isActive ? "is-active" : ""} end={to === "/"}><Icon size={18} /><span>{label}</span></NavLink>)}</nav>
  </div>;
}
