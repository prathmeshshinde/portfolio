import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  THEME_COLORS,
  THEME_STORAGE_KEY,
  ThemeContext,
  currentTheme,
  setThemeColorMeta,
  type Theme,
} from "@/lib/theme-context";
import { writeString } from "@/lib/storage";

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  // Disable transitions for one frame so every colour switches at once.
  root.setAttribute("data-theme-switching", "");
  root.classList.toggle("dark", theme === "dark");
  root.style.colorScheme = theme;
  if (!root.classList.contains("arcade")) setThemeColorMeta(THEME_COLORS[theme]);
  root.getBoundingClientRect();
  window.setTimeout(() => root.removeAttribute("data-theme-switching"), 0);
}

export default function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(currentTheme);

  const setTheme = useCallback((next: Theme) => {
    applyTheme(next);
    writeString(THEME_STORAGE_KEY, next);
    setThemeState(next);
  }, []);

  const toggleTheme = useCallback(() => setTheme(currentTheme() === "dark" ? "light" : "dark"), [setTheme]);

  // Keep several open tabs in sync.
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== THEME_STORAGE_KEY) return;
      const next: Theme = event.newValue === "light" ? "light" : "dark";
      applyTheme(next);
      setThemeState(next);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const value = useMemo(() => ({ theme, setTheme, toggleTheme }), [theme, setTheme, toggleTheme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
