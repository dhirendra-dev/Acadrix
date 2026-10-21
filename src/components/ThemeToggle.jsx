import React, { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";
import { resolveTheme, setStoredTheme } from "@/hooks/useTheme";

export default function ThemeToggle({ inline = false }) {
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    setTheme(resolveTheme());
  }, []);

  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    setStoredTheme(next);
    if (next === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const base =
    "inline-flex h-9 w-9 items-center justify-center transition active:scale-95";
  const cls = inline
    ? `${base} rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground hover:border-foreground/20`
    : `${base} fixed right-14 top-3 z-50 rounded-lg border border-border bg-card shadow-float text-muted-foreground hover:text-foreground`;

  return (
    <button onClick={toggle} aria-label="Toggle theme" className={cls}>
      {theme === "dark" ? (
        <Sun className="h-[18px] w-[18px] text-amber-400" />
      ) : (
        <Moon className="h-[18px] w-[18px]" />
      )}
    </button>
  );
}