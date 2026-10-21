import React from "react";
import { Link } from "react-router-dom";
import { Send, MessageCircle, Heart, FolderOpen, Home as HomeIcon, BookPlus } from "lucide-react";

const LOGO_URL =
  "https://media.base44.com/images/public/6a4fdf2b258cb191501a9b70/8110b5b8f_file_000000005ad88211bae5cf9879f6baf9.png";
const TG_URL = "https://t.me/resource_dreamIIT";
const WA_URL = "https://whatsapp.com/channel/0029Vb85g354yltQpBgEMH2b";

export default function Footer() {
  return (
    <footer className="mt-4 border-t border-border bg-secondary/40">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3">
              <span className="sheen inline-flex h-10 w-10 shrink-0 overflow-hidden rounded-xl ring-1 ring-border">
                <img
                  src={LOGO_URL}
                  alt="Quantum Vault"
                  className="h-full w-full object-cover"
                />
              </span>
              <div>
                <h3 className="text-sm font-bold text-foreground">
                  Resources by Quantum Vault
                </h3>
                <p className="text-xs font-medium text-muted-foreground">
                  Curated JEE resources
                </p>
              </div>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
              Free, organized JEE preparation materials — notes, PYQs, DPPs,
              books and more. Built for aspirants, by aspirants.
            </p>
            <div className="mt-5 flex items-center gap-2">
              <a
                href={TG_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Telegram"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition hover:text-foreground hover:border-foreground/20"
              >
                <Send className="h-4 w-4" />
              </a>
              <a
                href={WA_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition hover:text-foreground hover:border-foreground/20"
              >
                <MessageCircle className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Explore */}
          <div>
            <h4 className="section-eyebrow">Explore</h4>
            <ul className="mt-4 space-y-3 text-sm">
              <li>
                <Link
                  to="/"
                  className="inline-flex items-center gap-2 text-muted-foreground transition hover:text-foreground"
                >
                  <HomeIcon className="h-4 w-4" /> Home
                </Link>
              </li>
              <li>
                <Link
                  to="/resources"
                  className="inline-flex items-center gap-2 text-muted-foreground transition hover:text-foreground"
                >
                  <FolderOpen className="h-4 w-4" /> Resources
                </Link>
              </li>
              <li>
                <Link
                  to="/requests"
                  className="inline-flex items-center gap-2 text-muted-foreground transition hover:text-foreground"
                >
                  <BookPlus className="h-4 w-4" /> Request Resources
                </Link>
              </li>
            </ul>
          </div>

          {/* About */}
          <div>
            <h4 className="section-eyebrow">About</h4>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li>100% Free forever</li>
              <li>Updated regularly</li>
              <li>JEE Main & Advanced</li>
              <li>Community driven</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Quantum Vault. All resources are
            free for JEE aspirants.
          </p>
          <p className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            Made with <Heart className="h-3 w-3 text-rose-500" /> for JEE students
          </p>
        </div>
      </div>
    </footer>
  );
}