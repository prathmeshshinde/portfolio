import {
  Component,
  Suspense,
  lazy,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { GameContext, loadSnakeGame } from "./game-context";
import { useScrollLock } from "@/hooks/use-scroll-lock";
import { THEME_COLORS, currentTheme, setThemeColorMeta } from "@/lib/theme-context";

const SnakeGame = lazy(loadSnakeGame);

const KONAMI = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];

/**
 * Owns the Snake game overlay: lazy-loads it, switches the whole site into the neon
 * "arcade" theme while it is open, and listens for the Konami code as a shortcut.
 */
export default function GameProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const wasOpenRef = useRef(false);

  const open = useCallback(() => {
    if (document.activeElement instanceof HTMLElement) returnFocusRef.current = document.activeElement;
    setIsOpen(true);
  }, []);
  const close = useCallback(() => setIsOpen(false), []);
  const preload = useCallback(() => {
    loadSnakeGame().catch(() => undefined);
  }, []);

  useScrollLock(isOpen);

  useEffect(() => {
    const root = document.documentElement;
    if (isOpen) {
      wasOpenRef.current = true;
      root.classList.add("arcade");
      setThemeColorMeta(THEME_COLORS.arcade);
      return;
    }
    root.classList.remove("arcade");
    setThemeColorMeta(THEME_COLORS[currentTheme()]);
    if (wasOpenRef.current) {
      wasOpenRef.current = false;
      returnFocusRef.current?.focus({ preventScroll: true });
      returnFocusRef.current = null;
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) return;
    let progress = 0;
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) return;
      const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
      if (key === KONAMI[progress]) {
        progress += 1;
        if (progress === KONAMI.length) {
          progress = 0;
          open();
        }
      } else if (key === "ArrowUp") {
        progress = progress === 2 ? 2 : 1;
      } else {
        progress = 0;
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, open]);

  const value = useMemo(() => ({ isOpen, open, close, preload }), [isOpen, open, close, preload]);

  return (
    <GameContext.Provider value={value}>
      {children}
      {isOpen && (
        <GameErrorBoundary onClose={close}>
          <Suspense fallback={<GameLoading />}>
            <SnakeGame onClose={close} />
          </Suspense>
        </GameErrorBoundary>
      )}
    </GameContext.Provider>
  );
}

function GameLoading() {
  return createPortal(
    <div role="status" className="fixed inset-0 z-[100] grid place-items-center bg-background/85 backdrop-blur-md">
      <p className="arcade-blink font-mono text-sm uppercase tracking-[0.4em] text-primary">Loading game…</p>
    </div>,
    document.body,
  );
}

class GameErrorBoundary extends Component<{ onClose: () => void; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    console.error("The Snake game failed to load", error);
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return createPortal(
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="game-error-title"
        className="fixed inset-0 z-[100] grid place-items-center bg-background/85 p-6 backdrop-blur-md"
      >
        <div className="max-w-sm space-y-4 border border-border bg-card p-6 text-center">
          <p id="game-error-title" className="font-mono text-sm uppercase tracking-[0.3em] text-primary">
            Game over (early)
          </p>
          <p className="text-sm text-muted-foreground">The game couldn’t load. Check your connection and try again.</p>
          <button
            type="button"
            autoFocus
            onClick={this.props.onClose}
            className="border border-primary px-4 py-2 font-mono text-xs font-bold uppercase tracking-widest text-primary hover:bg-primary/10"
          >
            Close
          </button>
        </div>
      </div>,
      document.body,
    );
  }
}
