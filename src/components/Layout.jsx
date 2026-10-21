import React, { useState, useEffect } from "react";
import { useLocation, useOutlet, Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Home, FolderOpen, ShieldCheck, BookPlus } from "lucide-react";
import { useAppSession } from "@/hooks/useAppSession";
import Footer from "@/components/Footer";
import JoinChannelsPopup from "@/components/JoinChannelsPopup";
import FollowGate, { hasFollowedChannels } from "@/components/FollowGate";

const ADMIN_STORAGE_KEY = "dreamiit_admin_unlocked_v2";
const ADMIN_EXPIRY_KEY = "dreamiit_admin_expiry_v2";

export default function Layout() {
  const location = useLocation();
  const outlet = useOutlet();
  useAppSession();
  const [adminUnlocked, setAdminUnlocked] = useState(false);
  const [followDone, setFollowDone] = useState(() => hasFollowedChannels());

  useEffect(() => {
    const stored = localStorage.getItem(ADMIN_STORAGE_KEY) === "true";
    const expiry = Number(localStorage.getItem(ADMIN_EXPIRY_KEY) || 0);
    setAdminUnlocked(stored && Date.now() < expiry);
  }, [location.pathname]);

  const tabs = [
    { to: "/", label: "Home", icon: Home, exact: true },
    { to: "/requests", label: "Requests", icon: BookPlus, exact: true },
    ...(adminUnlocked
      ? [{ to: "/admin", label: "Admin", icon: ShieldCheck, exact: true }]
      : []),
    { to: "/resources", label: "Resources", icon: FolderOpen, exact: false },
  ];

  const isActive = (tab) => {
    if (tab.exact) return location.pathname === tab.to;
    return (
      location.pathname === tab.to || location.pathname.startsWith("/folder")
    );
  };

  return (
    <div className="min-h-screen bg-background overscroll-y-none">
      <main className="pb-28 md:pb-24">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            {outlet}
          </motion.div>
        </AnimatePresence>
        {location.pathname !== "/admin" && <Footer />}
      </main>

      {/* Mobile floating pill nav */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] md:hidden"
      >
        <div className="mx-auto flex max-w-sm items-center justify-around gap-1 rounded-2xl border border-border bg-card/95 p-1.5 shadow-float backdrop-blur-xl">
          {tabs.map(({ to, label, icon: Icon, exact }) => {
            const active = isActive({ to, exact });
            return (
              <Link
                key={to}
                to={to}
                className={`press-feedback flex flex-1 flex-col items-center gap-0.5 rounded-xl px-2 py-2 text-[11px] font-semibold transition ${
                  active
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="h-[18px] w-[18px]" />
                {label}
              </Link>
            );
          })}
        </div>
      </nav>

      {location.pathname !== "/admin" &&
        (location.pathname.startsWith("/app") ? (
          <JoinChannelsPopup appRoute />
        ) : (
          !followDone && <FollowGate onDone={() => setFollowDone(true)} />
        ))}
    </div>
  );
}