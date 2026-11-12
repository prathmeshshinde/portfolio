import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/use-theme";

export default function ThemeSwitch({ className }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  const dark = theme === "dark";
  const label = dark ? "Switch to light theme" : "Switch to dark theme";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={dark}
      aria-label={label}
      title={label}
      onClick={toggleTheme}
      className={cn(
        "relative inline-flex h-8 w-[3.75rem] shrink-0 items-center border border-border bg-surface px-[3px] transition-colors hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
    >
      <Sun className="pointer-events-none absolute left-[9px] h-3.5 w-3.5 text-muted-foreground/60" aria-hidden="true" />
      <Moon className="pointer-events-none absolute right-[9px] h-3.5 w-3.5 text-muted-foreground/60" aria-hidden="true" />
      <span
        className={cn(
          "relative z-10 grid h-6 w-6 place-items-center bg-primary text-primary-foreground transition-transform duration-300 ease-out",
          dark ? "translate-x-7" : "translate-x-0",
        )}
      >
        {dark ? <Moon className="h-3.5 w-3.5" aria-hidden="true" /> : <Sun className="h-3.5 w-3.5" aria-hidden="true" />}
      </span>
    </button>
  );
}
