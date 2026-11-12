import { useEffect, useState, type ReactNode } from "react";
import { useReducedMotion } from "framer-motion";
import { RotateCcw } from "lucide-react";
import { profile } from "@/data/profile";

type Kind = "comment" | "keyword" | "string" | "prop" | "punct" | "bool" | "type";
interface Token {
  text: string;
  kind: Kind;
}

const tokenClass: Record<Kind, string> = {
  comment: "italic text-muted-foreground/70",
  keyword: "text-primary",
  string: "text-secondary",
  prop: "text-foreground",
  punct: "text-muted-foreground",
  bool: "text-primary",
  type: "text-secondary",
};

const t = (text: string, kind: Kind): Token => ({ text, kind });
const str = (value: string) => t(`"${value}"`, "string");
const list = (items: string[]): Token[] => [
  t("[", "punct"),
  ...items.flatMap((item, index) => (index < items.length - 1 ? [str(item), t(", ", "punct")] : [str(item)])),
  t("]", "punct"),
];

const LINES: Token[][] = [
  [t("// Clean code. Sharp, accessible UI.", "comment")],
  [t("export const ", "keyword"), t("developer", "prop"), t(" = {", "punct")],
  [t("  name", "prop"), t(": ", "punct"), str(profile.name), t(",", "punct")],
  [t("  role", "prop"), t(": ", "punct"), str(profile.role), t(",", "punct")],
  [t("  stack", "prop"), t(": ", "punct"), ...list(["React", "Next.js", "TypeScript", "Redux"]), t(",", "punct")],
  [t("  testing", "prop"), t(": ", "punct"), ...list(["Jest", "Cypress"]), t(",", "punct")],
  [t("  openToWork", "prop"), t(": ", "punct"), t("true", "bool"), t(",", "punct")],
  [t("} ", "punct"), t("satisfies ", "keyword"), t("Developer", "type"), t(";", "punct")],
];

/* Typing schedule: each line starts after the previous one, long lines type a little faster. */
const START_DELAY = 500;
const LINE_PAUSE = 110;
const TIMELINE = (() => {
  let cursor = START_DELAY;
  return LINES.map((tokens) => {
    const chars = tokens.reduce((sum, token) => sum + token.text.length, 0);
    const perChar = Math.min(17, 620 / Math.max(1, chars));
    const entry = { start: cursor, chars, perChar };
    cursor += chars * perChar + LINE_PAUSE;
    return entry;
  });
})();
const LAST = TIMELINE[TIMELINE.length - 1];
const TOTAL_MS = LAST.start + LAST.chars * LAST.perChar;

function Caret({ blink }: { blink: boolean }) {
  return <span aria-hidden="true" className="type-caret" data-blink={blink || undefined} />;
}

/** An editor window whose code types itself out. Untyped characters stay in the DOM (invisible) for screen readers. */
export default function CodeWindow() {
  const reduceMotion = useReducedMotion();
  const [run, setRun] = useState(0);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (reduceMotion) {
      setElapsed(TOTAL_MS);
      return;
    }
    setElapsed(0);
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const time = now - start;
      setElapsed(Math.min(time, TOTAL_MS));
      if (time < TOTAL_MS) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [run, reduceMotion]);

  const done = elapsed >= TOTAL_MS;

  return (
    <div className="relative isolate">
      <div
        aria-hidden="true"
        className="absolute -inset-4 -z-10 bg-gradient-to-br from-primary/25 via-transparent to-secondary/25 opacity-70 blur-3xl"
      />
      <figure className="overflow-hidden border border-border bg-card shadow-2xl shadow-black/10 dark:shadow-black/50">
        <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-2.5">
          <div className="flex items-center gap-3">
            <span aria-hidden="true" className="flex gap-1.5">
              <span className="h-2.5 w-2.5 bg-primary/80" />
              <span className="h-2.5 w-2.5 bg-secondary/80" />
              <span className="h-2.5 w-2.5 bg-border" />
            </span>
            <figcaption className="font-mono text-xs text-muted-foreground">developer.ts</figcaption>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/70">TypeScript</span>
            <button
              type="button"
              onClick={() => setRun((value) => value + 1)}
              aria-label="Replay the typing animation"
              title="Replay"
              className="grid h-7 w-7 place-items-center border border-transparent text-muted-foreground transition-colors hover:border-border hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>

        <pre className="overflow-x-auto p-6 font-mono text-[13px] leading-loose xl:p-7 xl:text-[15px]">
          <code className="block">
            {LINES.map((tokens, index) => {
              const { start, chars, perChar } = TIMELINE[index];
              const visible = Math.max(0, Math.min(chars, Math.floor((elapsed - start) / perChar)));
              const typingHere = !done && elapsed >= start && visible < chars;
              const isLast = index === LINES.length - 1;

              let remaining = visible;
              let caretPlaced = false;
              const parts: ReactNode[] = tokens.map((token, tokenIndex) => {
                const shown = token.text.slice(0, Math.max(0, remaining));
                const hidden = token.text.slice(shown.length);
                remaining -= token.text.length;
                const caret = typingHere && !caretPlaced && hidden.length > 0;
                if (caret) caretPlaced = true;
                return (
                  <span key={tokenIndex} className={tokenClass[token.kind]}>
                    {shown}
                    {caret && <Caret blink={false} />}
                    {hidden && <span className="opacity-0">{hidden}</span>}
                  </span>
                );
              });

              return (
                <span key={index} className="flex">
                  <span aria-hidden="true" className="w-6 shrink-0 select-none text-right text-muted-foreground/40">
                    {index + 1}
                  </span>
                  <span className="whitespace-pre ps-5">
                    {parts}
                    {done && isLast && <Caret blink />}
                  </span>
                </span>
              );
            })}
          </code>
        </pre>
      </figure>
    </div>
  );
}
