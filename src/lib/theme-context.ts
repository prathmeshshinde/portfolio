import { createContext } from "react";

export type Theme = "light" | "dark";

export interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextValue | null>(null);

export const THEME_STORAGE_KEY = "theme";

/** Browser UI colours (address bar etc.) — keep in sync with --background in index.css. */
export const THEME_COLORS = {
  light: "#f9f8f6",
  dark: "#0a0b10",
  arcade: "#05050b",
} as const;

export function setThemeColorMeta(color: string) {
  document.querySelectorAll('meta[name="theme-color"]').forEach((meta) => meta.setAttribute("content", color));
}

export function currentTheme(): Theme {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}
