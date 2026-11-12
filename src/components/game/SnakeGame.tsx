import {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type CSSProperties,
  type FormEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ChevronLeft,
  Gamepad2,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  RotateCcw,
  Trophy,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { readJSON, readString, writeJSON, writeString } from "@/lib/storage";
import { useFocusTrap } from "@/hooks/use-focus-trap";
import {
  COMBO_WINDOW_MS,
  EFFECT_DURATION_MS,
  MODES,
  POWER_UPS,
  createGame,
  queueDirection,
  step,
  stepInterval,
  type Dir,
  type GameEvent,
  type GameState,
  type Mode,
  type PowerKind,
  type TimedEffect,
} from "./engine";
import { NEON, burst, createFx, drawGame, floatText, shake, updateFx } from "./renderer";
import { ArcadeAudio } from "./audio";
import {
  LEADERBOARD_SIZE,
  fetchLeaderboard,
  hasGlobalLeaderboard,
  qualifies,
  sanitizeName,
  submitScore,
  type LeaderboardSource,
  type ScoreEntry,
} from "./leaderboard";

type Status = "menu" | "countdown" | "playing" | "paused" | "over";

interface ActiveEffect {
  kind: TimedEffect;
  id: number;
  duration: number;
}

interface Hud {
  score: number;
  level: number;
  length: number;
}

interface Result {
  score: number;
  level: number;
  mode: Mode;
  newBest: boolean;
}

const MODE_KEY = "snake:mode";
const MUTED_KEY = "snake:muted";
const BEST_KEY = "snake:best:v1";
const NAME_KEY = "snake:name";
const MODE_LIST: Mode[] = ["classic", "arena"];

const KEY_TO_DIR: Record<string, Dir> = {
  ArrowUp: "up",
  ArrowDown: "down",
  ArrowLeft: "left",
  ArrowRight: "right",
  w: "up",
  W: "up",
  s: "down",
  S: "down",
  a: "left",
  A: "left",
  d: "right",
  D: "right",
};

const pad = (value: number, width = 6) => String(value).padStart(width, "0");

const media = (query: string) => typeof window !== "undefined" && !!window.matchMedia?.(query).matches;

function readGamepads(): Gamepad[] {
  try {
    return Array.from(navigator.getGamepads?.() ?? []).filter((gp): gp is Gamepad => !!gp);
  } catch {
    return [];
  }
}

export default function SnakeGame({ onClose }: { onClose: () => void }) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const startButtonRef = useRef<HTMLButtonElement>(null);
  const playAgainRef = useRef<HTMLButtonElement>(null);
  const swipeRef = useRef<{ x: number; y: number; id: number } | null>(null);
  const sizeRef = useRef({ px: 0, dpr: 1 });
  const timersRef = useRef<number[]>([]);

  const reducedMotion = useMemo(() => media("(prefers-reduced-motion: reduce)"), []);
  const coarsePointer = useMemo(() => media("(pointer: coarse)"), []);
  const fullscreenSupported = typeof document !== "undefined" && !!document.fullscreenEnabled;

  const audioRef = useRef<ArcadeAudio | null>(null);
  if (!audioRef.current) audioRef.current = new ArcadeAudio();
  const fxRef = useRef(createFx(reducedMotion));

  const [mode, setMode] = useState<Mode>(() => (readString(MODE_KEY) === "arena" ? "arena" : "classic"));
  const modeRef = useRef(mode);
  const gameRef = useRef<GameState | null>(null);
  if (!gameRef.current) gameRef.current = createGame(mode);

  const [status, setStatusState] = useState<Status>("menu");
  const statusRef = useRef<Status>("menu");
  const setStatus = useCallback((next: Status) => {
    statusRef.current = next;
    setStatusState(next);
  }, []);

  const [hud, setHud] = useState<Hud>({ score: 0, level: 1, length: gameRef.current.snake.length });
  const [effects, setEffects] = useState<ActiveEffect[]>([]);
  const [combo, setCombo] = useState<{ value: number; id: number } | null>(null);
  const [countdown, setCountdown] = useState(3);
  const [showGo, setShowGo] = useState(false);
  const [muted, setMuted] = useState(() => readString(MUTED_KEY) === "1");
  const [best, setBest] = useState<Record<Mode, number>>(() => ({
    classic: 0,
    arena: 0,
    ...readJSON<Partial<Record<Mode, number>>>(BEST_KEY, {}),
  }));
  const bestRef = useRef(best);
  const [result, setResult] = useState<Result | null>(null);
  const [boards, setBoards] = useState<Record<Mode, ScoreEntry[]>>({ classic: [], arena: [] });
  const [boardSource, setBoardSource] = useState<LeaderboardSource>(hasGlobalLeaderboard ? "global" : "local");
  const [boardLoading, setBoardLoading] = useState(true);
  const [boardTab, setBoardTab] = useState<Mode>(mode);
  const [showBoardOverlay, setShowBoardOverlay] = useState(false);
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const [playerName, setPlayerName] = useState(() => readString(NAME_KEY) ?? "");
  const [submitState, setSubmitState] = useState<"idle" | "saving" | "saved">("idle");
  const [gamepadConnected, setGamepadConnected] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [announcement, setAnnouncement] = useState("");

  useFocusTrap(dialogRef, true);

  useEffect(() => {
    bestRef.current = best;
  }, [best]);

  /* ---------------------------------------------------------------- */
  /*  Helpers                                                          */
  /* ---------------------------------------------------------------- */
  const later = useCallback((fn: () => void, ms: number) => {
    timersRef.current.push(window.setTimeout(fn, ms));
  }, []);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
  }, []);

  const resetBoard = useCallback(
    (nextMode: Mode) => {
      const game = createGame(nextMode);
      gameRef.current = game;
      fxRef.current = createFx(reducedMotion);
      setHud({ score: 0, level: 1, length: game.snake.length });
      setEffects([]);
      setCombo(null);
      setShowGo(false);
    },
    [reducedMotion],
  );

  const selectMode = useCallback(
    (next: Mode) => {
      if (statusRef.current !== "menu") return;
      modeRef.current = next;
      setMode(next);
      setBoardTab(next);
      writeString(MODE_KEY, next);
      resetBoard(next);
    },
    [resetBoard],
  );

  const finishGame = useCallback(() => {
    const game = gameRef.current!;
    later(() => {
      const newBest = game.score > bestRef.current[game.mode];
      if (newBest) {
        const next = { ...bestRef.current, [game.mode]: game.score };
        bestRef.current = next;
        setBest(next);
        writeJSON(BEST_KEY, next);
      }
      setResult({ score: game.score, level: game.level, mode: game.mode, newBest });
      setSubmitState("idle");
      setHighlightId(null);
      setBoardTab(game.mode);
      setShowBoardOverlay(false);
      setStatus("over");
      setAnnouncement(`Game over. You scored ${game.score} points${newBest ? " — a new personal best" : ""}.`);
    }, 750);
  }, [later, setStatus]);

  const handleEvents = useCallback(
    (events: GameEvent[]) => {
      const fx = fxRef.current;
      const audio = audioRef.current!;
      const game = gameRef.current!;
      for (const event of events) {
        switch (event.type) {
          case "eat":
            burst(fx, event.at, NEON.food, 12);
            floatText(fx, event.at, `+${event.points}`, event.combo > 1 ? NEON.yellow : NEON.text);
            audio.eat(event.combo);
            setCombo(event.combo > 1 ? { value: event.combo, id: performance.now() } : null);
            break;
          case "bonus":
            burst(fx, event.at, NEON.yellow, 24, 1.4);
            floatText(fx, event.at, `+${event.points}`, NEON.yellow);
            audio.bonus();
            break;
          case "power": {
            const meta = POWER_UPS[event.kind];
            burst(fx, event.at, meta.color, 18, 1.2);
            floatText(fx, event.at, meta.label.toUpperCase(), meta.color);
            audio.power();
            if (event.kind !== "trim") {
              const kind = event.kind;
              setEffects((prev) => [
                ...prev.filter((effect) => effect.kind !== kind),
                { kind, id: performance.now(), duration: EFFECT_DURATION_MS[kind] },
              ]);
            }
            setAnnouncement(`${meta.label} power-up`);
            break;
          }
          case "levelup":
            floatText(fx, game.snake[0], `LEVEL ${event.level}`, NEON.cyan);
            audio.levelUp();
            setAnnouncement(`Level ${event.level}`);
            break;
          case "die":
            burst(fx, event.at, NEON.danger, 40, 1.8);
            shake(fx);
            audio.die();
            setEffects([]);
            setCombo(null);
            finishGame();
            break;
        }
      }
      setHud({ score: game.score, level: game.level, length: game.snake.length });
    },
    [finishGame],
  );

  const startGame = useCallback(() => {
    clearTimers();
    const audio = audioRef.current!;
    audio.unlock();
    resetBoard(modeRef.current);
    setResult(null);
    setHighlightId(null);
    setSubmitState("idle");
    setShowBoardOverlay(false);
    setCountdown(3);
    setStatus("countdown");
    audio.countdown();
    boardRef.current?.focus({ preventScroll: true });

    let remaining = 3;
    const tick = () => {
      remaining -= 1;
      if (remaining > 0) {
        setCountdown(remaining);
        audio.countdown();
        later(tick, 520);
        return;
      }
      setStatus("playing");
      setShowGo(true);
      audio.go();
      setAnnouncement("Go!");
      later(() => setShowGo(false), 650);
    };
    later(tick, 520);
  }, [clearTimers, later, resetBoard, setStatus]);

  const pause = useCallback(() => {
    if (statusRef.current !== "playing" || !gameRef.current!.alive) return;
    setStatus("paused");
    setShowGo(false);
    setAnnouncement("Paused");
  }, [setStatus]);

  const resume = useCallback(() => {
    if (statusRef.current !== "paused") return;
    audioRef.current!.unlock();
    setStatus("playing");
    setAnnouncement("Resumed");
    boardRef.current?.focus({ preventScroll: true });
  }, [setStatus]);

  const backToMenu = useCallback(() => {
    clearTimers();
    setStatus("menu");
    setShowBoardOverlay(false);
    resetBoard(modeRef.current);
    window.requestAnimationFrame(() => startButtonRef.current?.focus({ preventScroll: true }));
  }, [clearTimers, resetBoard, setStatus]);

  const primaryAction = useCallback(() => {
    switch (statusRef.current) {
      case "menu":
      case "over":
        startGame();
        break;
      case "paused":
        resume();
        break;
      case "playing":
        pause();
        break;
      default:
        break;
    }
  }, [pause, resume, startGame]);

  const onDirection = useCallback(
    (dir: Dir) => {
      const current = statusRef.current;
      if (current === "playing" || current === "countdown") queueDirection(gameRef.current!, dir);
      else if (current === "menu" && (dir === "left" || dir === "right")) selectMode(dir === "left" ? "classic" : "arena");
    },
    [selectMode],
  );

  const toggleMute = useCallback(() => setMuted((value) => !value), []);

  const requestClose = useCallback(() => {
    if (document.fullscreenElement) void document.exitFullscreen().catch(() => undefined);
    onClose();
  }, [onClose]);

  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) void document.exitFullscreen().catch(() => undefined);
    else void dialogRef.current?.requestFullscreen().catch(() => undefined);
  }, []);

  /* Always call the latest handlers from long-lived listeners. */
  const handlersRef = useRef({ handleEvents, primaryAction, onDirection, pause, requestClose, toggleMute });
  useEffect(() => {
    handlersRef.current = { handleEvents, primaryAction, onDirection, pause, requestClose, toggleMute };
  });

  /* ---------------------------------------------------------------- */
  /*  Effects                                                          */
  /* ---------------------------------------------------------------- */
  useEffect(() => {
    audioRef.current!.muted = muted;
    writeString(MUTED_KEY, muted ? "1" : "0");
  }, [muted]);

  useEffect(() => {
    const audio = audioRef.current!;
    audio.unlock();
    startButtonRef.current?.focus({ preventScroll: true });
    return () => {
      clearTimers();
      audio.dispose();
    };
  }, [clearTimers]);

  useEffect(() => {
    let cancelled = false;
    Promise.all(MODE_LIST.map((m) => fetchLeaderboard(m))).then(([classic, arena]) => {
      if (cancelled) return;
      setBoards({ classic: classic.entries, arena: arena.entries });
      setBoardSource(classic.source === "global" || arena.source === "global" ? "global" : "local");
      setBoardLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const handlers = handlersRef.current;
      const target = event.target as HTMLElement | null;
      const typing = !!target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable);
      const current = statusRef.current;

      if (event.key === "Escape") {
        event.preventDefault();
        if (current === "playing" && gameRef.current!.alive) handlers.pause();
        else handlers.requestClose();
        return;
      }
      if (typing || event.altKey || event.ctrlKey || event.metaKey) return;

      const dir = KEY_TO_DIR[event.key];
      if (dir) {
        event.preventDefault();
        handlers.onDirection(dir);
        return;
      }

      if (event.key === " " || event.key === "Enter") {
        const onControl = !!target?.closest("button, a");
        // Let a focused button handle its own activation outside of play.
        if (onControl && current !== "playing" && current !== "countdown") return;
        event.preventDefault();
        if (!event.repeat) handlers.primaryAction();
        return;
      }
      if (event.key === "p" || event.key === "P") {
        event.preventDefault();
        if (current === "playing" || current === "paused") handlers.primaryAction();
        return;
      }
      if (event.key === "m" || event.key === "M") handlers.toggleMute();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden) handlersRef.current.pause();
    };
    const onBlur = () => handlersRef.current.pause();
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("blur", onBlur);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("blur", onBlur);
    };
  }, []);

  useEffect(() => {
    const update = () => setGamepadConnected(readGamepads().length > 0);
    update();
    window.addEventListener("gamepadconnected", update);
    window.addEventListener("gamepaddisconnected", update);
    return () => {
      window.removeEventListener("gamepadconnected", update);
      window.removeEventListener("gamepaddisconnected", update);
    };
  }, []);

  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  /* Main loop: fixed-step game logic, render every frame. */
  useEffect(() => {
    const canvas = canvasRef.current;
    const board = boardRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !board || !ctx) return;

    const resize = () => {
      const px = Math.max(1, Math.floor(board.clientWidth));
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      sizeRef.current = { px, dpr };
      canvas.width = Math.round(px * dpr);
      canvas.height = Math.round(px * dpr);
      canvas.style.width = `${px}px`;
      canvas.style.height = `${px}px`;
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(board);

    const padState: { dir: Dir | null; a: boolean; start: boolean } = { dir: null, a: false, start: false };
    const pollGamepad = () => {
      const gamepad = readGamepads()[0];
      if (!gamepad) return;
      const pressed = (index: number) => !!gamepad.buttons[index]?.pressed;
      let dir: Dir | null = null;
      if (pressed(12)) dir = "up";
      else if (pressed(13)) dir = "down";
      else if (pressed(14)) dir = "left";
      else if (pressed(15)) dir = "right";
      else {
        const x = gamepad.axes[0] ?? 0;
        const y = gamepad.axes[1] ?? 0;
        if (Math.max(Math.abs(x), Math.abs(y)) > 0.55) {
          dir = Math.abs(x) > Math.abs(y) ? (x > 0 ? "right" : "left") : y > 0 ? "down" : "up";
        }
      }
      if (dir && dir !== padState.dir) handlersRef.current.onDirection(dir);
      padState.dir = dir;

      const a = pressed(0);
      const start = pressed(9);
      if (a && !padState.a && statusRef.current !== "playing") handlersRef.current.primaryAction();
      if (start && !padState.start) handlersRef.current.primaryAction();
      padState.a = a;
      padState.start = start;
    };

    let raf = 0;
    let last = performance.now();
    let accumulator = 0;
    const frame = (now: number) => {
      const dt = Math.min(now - last, 100);
      last = now;
      pollGamepad();

      const game = gameRef.current!;
      if (statusRef.current === "playing" && game.alive) {
        game.time += dt;
        accumulator += dt;
        let steps = 0;
        while (game.alive && accumulator >= stepInterval(game) && steps < 4) {
          accumulator -= stepInterval(game);
          steps++;
          const events = step(game);
          if (events.length) handlersRef.current.handleEvents(events);
        }
        if (steps >= 4) accumulator = 0;
      } else {
        accumulator = 0;
      }

      updateFx(fxRef.current, dt);
      drawGame(ctx, game, fxRef.current, { px: sizeRef.current.px, dpr: sizeRef.current.dpr, now });
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, []);

  /* ---------------------------------------------------------------- */
  /*  Touch: swipe on the board                                        */
  /* ---------------------------------------------------------------- */
  const onPointerDown = (event: ReactPointerEvent) => {
    audioRef.current!.unlock();
    if (event.pointerType === "mouse") return;
    swipeRef.current = { x: event.clientX, y: event.clientY, id: event.pointerId };
  };
  const onPointerMove = (event: ReactPointerEvent) => {
    const start = swipeRef.current;
    if (!start || start.id !== event.pointerId) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 18) return;
    onDirection(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : dy > 0 ? "down" : "up");
    swipeRef.current = { x: event.clientX, y: event.clientY, id: event.pointerId };
  };
  const endSwipe = () => {
    swipeRef.current = null;
  };

  /* ---------------------------------------------------------------- */
  /*  Leaderboard submit                                               */
  /* ---------------------------------------------------------------- */
  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!result || submitState !== "idle") return;
    const name = sanitizeName(playerName);
    if (!name) return;
    writeString(NAME_KEY, name);
    setPlayerName(name);
    setSubmitState("saving");
    const { result: board, entry } = await submitScore({
      name,
      score: result.score,
      level: result.level,
      mode: result.mode,
    });
    setBoards((prev) => ({ ...prev, [entry.mode]: board.entries }));
    setBoardSource(board.source);
    const match =
      board.entries.find((e) => e.id === entry.id) ??
      board.entries.find((e) => e.name === entry.name && e.score === entry.score);
    setHighlightId(match?.id ?? null);
    setBoardTab(entry.mode);
    setSubmitState("saved");
    setAnnouncement("Score saved to the leaderboard.");
    window.requestAnimationFrame(() => playAgainRef.current?.focus({ preventScroll: true }));
  };

  /* ---------------------------------------------------------------- */
  /*  Render                                                           */
  /* ---------------------------------------------------------------- */
  const canSubmit = !!result && qualifies(boards[result.mode], result.score);
  const bestForMode = Math.max(best[mode], hud.score);
  const playing = status === "playing";

  const leaderboard = (
    <LeaderboardPanel
      boards={boards}
      tab={boardTab}
      onTab={setBoardTab}
      source={boardSource}
      loading={boardLoading}
      highlightId={highlightId}
      best={best}
    />
  );

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-stretch justify-center bg-background/80 backdrop-blur-md sm:items-center sm:p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) requestClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="snake-title"
        aria-describedby="snake-help"
        tabIndex={-1}
        className="relative flex h-full w-full max-w-6xl flex-col overflow-hidden bg-background text-foreground outline-none sm:h-auto sm:max-h-full sm:border sm:border-primary/40 sm:shadow-[0_0_80px_-20px_hsl(var(--primary)/0.55)]"
      >
        {/* Title bar */}
        <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-border px-3 sm:px-5">
          <div className="flex min-w-0 items-center gap-3">
            <Gamepad2 className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
            <h2 id="snake-title" className="truncate font-mono text-sm font-bold uppercase tracking-[0.3em] text-primary">
              Snake.exe
            </h2>
            <span className="hidden border border-border px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground sm:inline">
              {MODES[mode].label}
            </span>
            {gamepadConnected && (
              <span className="hidden items-center gap-1 font-mono text-[10px] uppercase tracking-widest text-secondary md:inline-flex">
                <Gamepad2 className="h-3 w-3" aria-hidden="true" /> Gamepad ready
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            {(status === "playing" || status === "paused") && (
              <ToolbarButton label={status === "paused" ? "Resume" : "Pause"} onClick={primaryAction}>
                {status === "paused" ? <Play /> : <Pause />}
              </ToolbarButton>
            )}
            <ToolbarButton label={muted ? "Unmute sound" : "Mute sound"} pressed={muted} onClick={toggleMute}>
              {muted ? <VolumeX /> : <Volume2 />}
            </ToolbarButton>
            {fullscreenSupported && (
              <ToolbarButton label={isFullscreen ? "Exit full screen" : "Full screen"} onClick={toggleFullscreen}>
                {isFullscreen ? <Minimize2 /> : <Maximize2 />}
              </ToolbarButton>
            )}
            <ToolbarButton label="Close game" onClick={requestClose}>
              <X />
            </ToolbarButton>
          </div>
        </header>

        <div className="grid min-h-0 flex-1 grid-cols-1 overflow-y-auto overscroll-contain lg:grid-cols-[minmax(0,1fr)_19rem] lg:overflow-hidden">
          {/* Play area */}
          <div className="flex min-w-0 flex-col items-center p-3 sm:p-5 lg:overflow-y-auto">
            <div
              className="flex w-full flex-col gap-3 [--board-max:calc(100dvh-16.5rem)] [@media(pointer:coarse)]:[--board-max:calc(100dvh-22rem)]"
              style={{ maxWidth: "min(100%, max(16rem, var(--board-max)))" }}
            >
              <dl className="grid grid-cols-4 border border-border bg-card font-mono">
                <HudCell label="Score" value={pad(hud.score)} highlight />
                <HudCell label="Best" value={pad(bestForMode)} />
                <HudCell label="Level" value={pad(hud.level, 2)} />
                <HudCell label="Length" value={pad(hud.length, 3)} />
              </dl>

              <div
                className="flex h-7 items-center gap-2 overflow-hidden"
                style={{ "--drain-state": playing ? "running" : "paused" } as CSSProperties}
                aria-hidden="true"
              >
                {combo && (
                  <EffectChip
                    key={`combo-${combo.id}`}
                    color={NEON.yellow}
                    label={`Combo ×${combo.value}`}
                    duration={COMBO_WINDOW_MS}
                    onDone={() => setCombo(null)}
                  />
                )}
                {effects.map((effect) => (
                  <EffectChip
                    key={effect.id}
                    color={POWER_UPS[effect.kind].color}
                    label={POWER_UPS[effect.kind].label}
                    duration={effect.duration}
                    onDone={() => setEffects((prev) => prev.filter((item) => item.id !== effect.id))}
                  />
                ))}
                {!combo && effects.length === 0 && (
                  <span className="truncate font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground/70">
                    {playing ? "Eat fast to build a combo" : `${MODES[mode].label} · ${MODES[mode].tagline}`}
                  </span>
                )}
              </div>

              {/* Board */}
              <div
                ref={boardRef}
                tabIndex={-1}
                className="relative aspect-square w-full select-none overflow-hidden border border-primary/30 outline-none"
              >
                <canvas
                  ref={canvasRef}
                  role="img"
                  aria-label={`Snake board — score ${hud.score}, level ${hud.level}`}
                  className="absolute inset-0 block touch-none"
                  onPointerDown={onPointerDown}
                  onPointerMove={onPointerMove}
                  onPointerUp={endSwipe}
                  onPointerCancel={endSwipe}
                />
                <div aria-hidden="true" className="crt-lines absolute inset-0" />

                {status === "menu" && !showBoardOverlay && (
                  <Screen>
                    <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-secondary sm:text-xs">Insert coin</p>
                    <p className="font-display text-5xl font-bold tracking-tight text-gradient sm:text-6xl">SNAKE</p>
                    <div role="radiogroup" aria-label="Game mode" className="grid w-full max-w-sm grid-cols-2 gap-2">
                      {MODE_LIST.map((m) => (
                        <button
                          key={m}
                          type="button"
                          role="radio"
                          aria-checked={mode === m}
                          onClick={() => selectMode(m)}
                          className={cn(
                            "border px-3 py-2.5 text-start transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                            mode === m
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border text-foreground hover:border-primary/60",
                          )}
                        >
                          <span className="block font-mono text-xs font-bold uppercase tracking-widest">{MODES[m].label}</span>
                          <span className="mt-0.5 block text-[11px] text-muted-foreground">{MODES[m].tagline}</span>
                        </button>
                      ))}
                    </div>
                    <p className="max-w-xs text-xs leading-relaxed text-muted-foreground">{MODES[mode].description}</p>
                    <button
                      ref={startButtonRef}
                      type="button"
                      onClick={startGame}
                      className="arcade-glow inline-flex items-center gap-2 bg-primary px-6 py-3 font-mono text-sm font-bold uppercase tracking-[0.25em] text-primary-foreground transition-transform hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground"
                    >
                      <Play className="h-4 w-4" aria-hidden="true" /> Press start
                    </button>
                    <p className="hidden font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground [@media(pointer:fine)]:block">
                      Enter / Space to start · ← → to switch mode
                    </p>
                    <OverlayButton className="lg:hidden" onClick={() => setShowBoardOverlay(true)}>
                      <Trophy className="h-4 w-4" aria-hidden="true" /> High scores
                    </OverlayButton>
                  </Screen>
                )}

                {status === "countdown" && (
                  <div className="pointer-events-none absolute inset-0 grid place-items-center bg-background/30">
                    <span
                      key={countdown}
                      className="countdown-pop font-display text-8xl font-bold text-primary [text-shadow:0_0_32px_hsl(var(--primary)/0.8)]"
                    >
                      {countdown}
                    </span>
                  </div>
                )}

                {showGo && playing && (
                  <div className="pointer-events-none absolute inset-0 grid place-items-center">
                    <span className="countdown-pop font-display text-7xl font-bold text-secondary [text-shadow:0_0_32px_hsl(var(--secondary)/0.8)]">
                      GO!
                    </span>
                  </div>
                )}

                {status === "paused" && (
                  <Screen>
                    <p className="arcade-blink font-display text-4xl font-bold text-primary">Paused</p>
                    <div className="flex w-full max-w-[15rem] flex-col gap-2">
                      <OverlayButton variant="primary" onClick={resume} autoFocus>
                        <Play className="h-4 w-4" aria-hidden="true" /> Resume
                      </OverlayButton>
                      <OverlayButton onClick={startGame}>
                        <RotateCcw className="h-4 w-4" aria-hidden="true" /> Restart
                      </OverlayButton>
                      <OverlayButton onClick={backToMenu}>Change mode</OverlayButton>
                    </div>
                  </Screen>
                )}

                {status === "over" && result && !showBoardOverlay && (
                  <Screen>
                    <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-secondary sm:text-xs">Game over</p>
                    <p className="font-display text-5xl font-bold tabular-nums text-gradient sm:text-6xl">
                      {result.score.toLocaleString()}
                    </p>
                    <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                      Level {result.level} · {MODES[result.mode].label}
                    </p>
                    {result.newBest && (
                      <p className="arcade-blink border border-secondary px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-secondary">
                        New personal best
                      </p>
                    )}

                    {canSubmit && submitState !== "saved" ? (
                      <form onSubmit={handleSubmit} className="flex w-full max-w-xs gap-2">
                        <label htmlFor="snake-name" className="sr-only">
                          Name for the leaderboard
                        </label>
                        <input
                          id="snake-name"
                          value={playerName}
                          onChange={(event) => setPlayerName(event.target.value.slice(0, 12))}
                          maxLength={12}
                          autoComplete="nickname"
                          placeholder="Your name"
                          autoFocus={!coarsePointer}
                          className="min-w-0 flex-1 border border-border bg-background px-3 py-2 font-mono text-sm uppercase tracking-widest text-foreground placeholder:text-muted-foreground/60 focus-visible:border-primary focus-visible:outline-none"
                        />
                        <button
                          type="submit"
                          disabled={submitState === "saving" || !sanitizeName(playerName)}
                          className="border border-primary bg-primary/15 px-3 py-2 font-mono text-xs font-bold uppercase tracking-widest text-primary transition-colors hover:bg-primary/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
                        >
                          {submitState === "saving" ? "Saving…" : "Save"}
                        </button>
                      </form>
                    ) : submitState === "saved" ? (
                      <p className="font-mono text-[11px] uppercase tracking-widest text-secondary">Score saved ✓</p>
                    ) : result.score > 0 ? (
                      <p className="max-w-xs text-xs text-muted-foreground">
                        Not a top-{LEADERBOARD_SIZE} score this time — go again!
                      </p>
                    ) : null}

                    <div className="flex flex-wrap justify-center gap-2">
                      <OverlayButton ref={playAgainRef} variant="primary" onClick={startGame} autoFocus={!canSubmit}>
                        <RotateCcw className="h-4 w-4" aria-hidden="true" /> Play again
                      </OverlayButton>
                      <OverlayButton onClick={backToMenu}>Change mode</OverlayButton>
                    </div>
                    <OverlayButton className="lg:hidden" onClick={() => setShowBoardOverlay(true)}>
                      <Trophy className="h-4 w-4" aria-hidden="true" /> High scores
                    </OverlayButton>
                  </Screen>
                )}

                {showBoardOverlay && (status === "menu" || status === "over") && (
                  <Screen className="justify-start">
                    <div className="w-full max-w-sm text-start">{leaderboard}</div>
                    <OverlayButton onClick={() => setShowBoardOverlay(false)} autoFocus>
                      <ChevronLeft className="h-4 w-4" aria-hidden="true" /> Back
                    </OverlayButton>
                  </Screen>
                )}
              </div>

              {/* Touch D-pad */}
              <div
                role="group"
                aria-label="Direction pad"
                className="hidden select-none grid-cols-3 gap-2 self-center [@media(pointer:coarse)]:grid"
              >
                <span />
                <DpadButton dir="up" onDirection={onDirection} />
                <span />
                <DpadButton dir="left" onDirection={onDirection} />
                <button
                  type="button"
                  onClick={primaryAction}
                  aria-label={status === "playing" ? "Pause" : status === "paused" ? "Resume" : "Start"}
                  className="grid h-12 w-12 place-items-center border border-primary/50 bg-primary/10 text-primary active:bg-primary/25"
                >
                  {status === "playing" ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                </button>
                <DpadButton dir="right" onDirection={onDirection} />
                <span />
                <DpadButton dir="down" onDirection={onDirection} />
                <span />
              </div>

              <p className="hidden flex-wrap items-center justify-center gap-x-3 gap-y-1 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground [@media(pointer:fine)]:flex">
                <Kbd>← ↑ ↓ →</Kbd> move <Kbd>Space</Kbd> pause <Kbd>M</Kbd> sound <Kbd>Esc</Kbd> exit
              </p>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="border-t border-border lg:overflow-y-auto lg:border-l lg:border-t-0">
            {leaderboard}
            <HowToPlay />
          </aside>
        </div>

        <p id="snake-help" className="sr-only">
          Steer with the arrow keys or W, A, S, D. Press Enter or Space to start and pause, M to toggle sound, and Escape
          to pause or close the game.
        </p>
        <div aria-live="polite" aria-atomic="true" className="sr-only">
          {announcement}
        </div>
      </div>
    </div>,
    document.body,
  );
}

/* ------------------------------------------------------------------ */
/*  Small presentational pieces                                        */
/* ------------------------------------------------------------------ */
function Screen({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className="absolute inset-0 overflow-y-auto bg-background/85 backdrop-blur-[2px]">
      <div
        className={cn(
          "flex min-h-full flex-col items-center justify-center gap-3 p-4 text-center sm:gap-4 sm:p-6",
          className,
        )}
      >
        {children}
      </div>
    </div>
  );
}

const OverlayButton = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "outline" }
>(function OverlayButton({ variant = "outline", className, children, ...props }, ref) {
  return (
    <button
      ref={ref}
      type="button"
      className={cn(
        "inline-flex items-center justify-center gap-2 border px-4 py-2.5 font-mono text-xs font-bold uppercase tracking-[0.2em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        variant === "primary"
          ? "border-primary bg-primary text-primary-foreground hover:bg-primary/85"
          : "border-border bg-card/80 text-foreground hover:border-primary hover:text-primary",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
});

function ToolbarButton({
  label,
  onClick,
  pressed,
  children,
}: {
  label: string;
  onClick: () => void;
  pressed?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={pressed}
      title={label}
      className="inline-flex h-9 w-9 items-center justify-center border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&_svg]:h-4 [&_svg]:w-4"
    >
      {children}
    </button>
  );
}

function HudCell({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="min-w-0 border-e border-border px-2 py-1.5 last:border-e-0 sm:px-3 sm:py-2">
      <dt className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground sm:text-[10px]">{label}</dt>
      <dd className={cn("truncate text-sm font-bold tabular-nums sm:text-lg", highlight ? "text-primary" : "text-foreground")}>
        {value}
      </dd>
    </div>
  );
}

function EffectChip({
  color,
  label,
  duration,
  onDone,
}: {
  color: string;
  label: string;
  duration: number;
  onDone: () => void;
}) {
  return (
    <span
      className="relative inline-flex shrink-0 items-center overflow-hidden border px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest sm:text-[11px]"
      style={{ borderColor: color, color }}
    >
      {label}
      <span
        className="drain-bar absolute inset-x-0 bottom-0 h-0.5"
        style={{ background: color, "--drain-duration": `${duration}ms` } as CSSProperties}
        onAnimationEnd={onDone}
      />
    </span>
  );
}

const DPAD_ICONS: Record<Dir, typeof ArrowUp> = { up: ArrowUp, down: ArrowDown, left: ArrowLeft, right: ArrowRight };

function DpadButton({ dir, onDirection }: { dir: Dir; onDirection: (dir: Dir) => void }) {
  const Icon = DPAD_ICONS[dir];
  return (
    <button
      type="button"
      aria-label={`Move ${dir}`}
      onPointerDown={(event) => {
        event.preventDefault();
        onDirection(dir);
      }}
      onClick={(event) => {
        // Keyboard activation only — touch is handled on pointer down for zero latency.
        if (event.detail === 0) onDirection(dir);
      }}
      className="grid h-12 w-12 touch-none place-items-center border border-border bg-card text-primary active:border-primary active:bg-primary/20"
    >
      <Icon className="h-5 w-5" aria-hidden="true" />
    </button>
  );
}

function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd className="border border-border bg-card px-1.5 py-0.5 font-mono text-[10px] text-foreground">{children}</kbd>
  );
}

function LeaderboardPanel({
  boards,
  tab,
  onTab,
  source,
  loading,
  highlightId,
  best,
}: {
  boards: Record<Mode, ScoreEntry[]>;
  tab: Mode;
  onTab: (mode: Mode) => void;
  source: LeaderboardSource;
  loading: boolean;
  highlightId: string | null;
  best: Record<Mode, number>;
}) {
  const entries = boards[tab];
  return (
    <section aria-label="High scores" className="space-y-4 p-5">
      <div className="flex items-center justify-between gap-3">
        <h3 className="inline-flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-[0.25em] text-primary">
          <Trophy className="h-4 w-4" aria-hidden="true" /> High scores
        </h3>
        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          {source === "global" ? "Global" : "This device"}
        </span>
      </div>

      <div className="grid grid-cols-2 border border-border" aria-label="Leaderboard mode">
        {MODE_LIST.map((m) => (
          <button
            key={m}
            type="button"
            aria-pressed={tab === m}
            onClick={() => onTab(m)}
            className={cn(
              "px-3 py-2 font-mono text-[11px] font-bold uppercase tracking-widest transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
              tab === m ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {MODES[m].label}
          </button>
        ))}
      </div>

      <ol className="divide-y divide-border border border-border">
        {loading ? (
          <li className="px-3 py-6 text-center font-mono text-xs text-muted-foreground">Loading…</li>
        ) : entries.length === 0 ? (
          <li className="px-3 py-6 text-center font-mono text-xs text-muted-foreground">No scores yet — be the first.</li>
        ) : (
          entries.map((entry, index) => (
            <li
              key={entry.id}
              className={cn(
                "grid grid-cols-[1.75rem_minmax(0,1fr)_auto] items-center gap-2 px-3 py-2 font-mono text-xs",
                entry.id === highlightId && "bg-primary/15 text-primary",
              )}
            >
              <span className={cn("tabular-nums", index < 3 ? "text-secondary" : "text-muted-foreground")}>
                {pad(index + 1, 2)}
              </span>
              <span className="truncate uppercase tracking-wider">{entry.name}</span>
              <span className="font-bold tabular-nums">{entry.score.toLocaleString()}</span>
            </li>
          ))
        )}
      </ol>

      <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        Your best ({MODES[tab].label}): <span className="text-foreground">{best[tab].toLocaleString()}</span>
      </p>
    </section>
  );
}

const POWER_LIST = Object.entries(POWER_UPS) as Array<[PowerKind, (typeof POWER_UPS)[PowerKind]]>;

function HowToPlay() {
  return (
    <section aria-label="How to play" className="space-y-4 border-t border-border p-5">
      <h3 className="font-mono text-xs font-bold uppercase tracking-[0.25em] text-primary">How to play</h3>
      <ul className="space-y-2.5 text-xs leading-relaxed text-muted-foreground">
        <li className="flex items-start gap-3">
          <span className="mt-0.5 h-4 w-4 shrink-0 rounded-full" style={{ background: NEON.food }} aria-hidden="true" />
          <span>
            <span className="font-semibold text-foreground">Byte</span> — points and +1 length. Eat again within 3s to
            build a combo, up to ×5.
          </span>
        </li>
        <li className="flex items-start gap-3">
          <span className="mt-0.5 h-3.5 w-3.5 shrink-0 rotate-45" style={{ background: NEON.yellow }} aria-hidden="true" />
          <span>
            <span className="font-semibold text-foreground">Golden byte</span> — big bonus, but it vanishes fast.
          </span>
        </li>
        {POWER_LIST.map(([kind, power]) => (
          <li key={kind} className="flex items-start gap-3">
            <span
              className="grid h-4 w-4 shrink-0 place-items-center font-mono text-[9px] font-bold"
              style={{ background: power.color, color: NEON.bg }}
              aria-hidden="true"
            >
              {power.glyph}
            </span>
            <span>
              <span className="font-semibold text-foreground">{power.label}</span> — {power.description}
            </span>
          </li>
        ))}
      </ul>
      <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 font-mono text-[11px] text-muted-foreground">
        <dt className="text-foreground">Move</dt>
        <dd>Arrows · WASD · swipe</dd>
        <dt className="text-foreground">Start / pause</dt>
        <dd>Enter · Space · P</dd>
        <dt className="text-foreground">Sound</dt>
        <dd>M</dd>
        <dt className="text-foreground">Exit</dt>
        <dd>Esc</dd>
        <dt className="text-foreground">Gamepad</dt>
        <dd>D-pad / stick · A start · Start pause</dd>
      </dl>
    </section>
  );
}
