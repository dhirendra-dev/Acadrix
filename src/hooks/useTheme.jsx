import { useEffect } from "react";

const STORAGE_KEY = "dreamiit_theme"; // "light" | "dark"

export function getStoredTheme() {
  try {
    return localStorage.getItem(STORAGE_KEY); // null if unset
  } catch {
    return null;
  }
}

export function setStoredTheme(theme) {
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    /* ignore */
  }
}

function systemPrefersDark() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

// Resolve the theme that should actually be applied right now.
export function resolveTheme() {
  const stored = getStoredTheme();
  if (stored === "light" || stored === "dark") return stored;
  return "dark"; // Default to dark mode for new users
}

export function useTheme() {
  useEffect(() => {
    const apply = (theme) => {
      if (theme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    };
    apply(resolveTheme());
  }, []);

  // Re-apply whenever another tab/component changes the stored theme.
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === STORAGE_KEY) applyThemeFromStorage();
    };
    const applyThemeFromStorage = () => {
      const theme = resolveTheme();
      if (theme === "dark") document.documentElement.classList.add("dark");
      else document.documentElement.classList.remove("dark");
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);
}