import React from "react";
import { Link, useLocation } from "react-router-dom";
import { MessageCircle } from "lucide-react";
import AdminUnlockModal from "@/components/AdminUnlockModal";
import ThemeToggle from "@/components/ThemeToggle";
import NotificationBar from "@/components/NotificationBar";

const LOGO_URL =
  "https://media.base44.com/images/public/6a4fdf2b258cb191501a9b70/8110b5b8f_file_000000005ad88211bae5cf9879f6baf9.png";
const WHATSAPP_CHANNEL_URL = "https://whatsapp.com/channel/0029Vb85g354yltQpBgEMH2b";

function NavLink({ to, label, active }) {
  return (
    <Link
      to={to}
      className={`press-feedback rounded-lg px-3.5 py-2 text-sm font-semibold transition ${
        active
          ? "bg-secondary text-foreground"
          : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
      }`}
    >
      {label}
    </Link>
  );
}

export default function AppHeader({ isAdmin, onLogoClick, adminModal }) {
  const location = useLocation();
  const isHome = location.pathname === "/";
  const isResources =
    location.pathname === "/resources" || location.pathname.startsWith("/folder");

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex h-16 items-center justify-between gap-3">
            {/* Brand */}
            <button
              onClick={onLogoClick}
              className="flex items-center gap-3 text-left"
            >
              <span className="sheen inline-flex h-9 w-9 shrink-0 overflow-hidden rounded-xl ring-1 ring-border">
                <img
                  src={LOGO_URL}
                  alt="Quantum Vault"
                  className="h-full w-full object-cover"
                />
              </span>
              <div className="min-w-0">
                <h1 className="truncate text-[15px] font-bold leading-tight tracking-tight text-foreground">
                  Quantum Vault
                </h1>
                <p className="hidden truncate text-[11px] font-medium text-muted-foreground sm:block">
                  JEE Resource Hub
                </p>
              </div>
            </button>

            {/* Right cluster */}
            <div className="flex items-center gap-1.5">
              {/* Desktop nav */}
              <nav className="mr-1 hidden items-center gap-1 md:flex">
                <NavLink to="/" label="Home" active={isHome} />
                <NavLink to="/resources" label="Resources" active={isResources} />
              </nav>

              <span className="mx-0.5 hidden h-6 w-px bg-border md:block" />

              <NotificationBar inline />
              <ThemeToggle inline />

              <span className="mx-0.5 hidden h-6 w-px bg-border sm:block" />

              <a
                href={WHATSAPP_CHANNEL_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-secondary hover:text-foreground"
              >
                <MessageCircle className="h-[18px] w-[18px]" />
              </a>
            </div>
          </div>
        </div>
      </header>

      <AdminUnlockModal
        open={adminModal.open}
        step={adminModal.step}
        passwordInput={adminModal.passwordInput}
        setPasswordInput={adminModal.setPasswordInput}
        error={adminModal.error}
        onClose={adminModal.onClose}
        onSubmitPassword={adminModal.onSubmitPassword}
      />
    </>
  );
}