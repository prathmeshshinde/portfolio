import { Gamepad2 } from "lucide-react";
import { useGame } from "@/hooks/use-game";
import Reveal from "@/components/common/Reveal";

/** Neon call-out that launches the Snake game. The whole card is clickable. */
export default function ArcadeBanner() {
  const { open, preload } = useGame();

  return (
    <Reveal>
      <div
        onPointerEnter={preload}
        className="arcade-banner group relative isolate overflow-hidden border border-[#00eaff]/30 p-8 transition-[border-color,box-shadow] duration-300 hover:border-[#00eaff]/70 hover:shadow-[0_0_60px_-12px_rgba(0,234,255,0.45)] sm:p-12"
      >
        <span aria-hidden="true" className="arcade-banner__sun -z-10" />
        <span aria-hidden="true" className="arcade-banner__grid -z-10" />
        <span aria-hidden="true" className="arcade-banner__scan -z-10" />

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="space-y-3 text-center lg:text-start">
            <p className="inline-flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-[0.3em] text-[#00eaff]">
              <span aria-hidden="true" className="h-1.5 w-1.5 animate-pulse bg-[#ff29d0]" />
              Insert coin
            </p>
            <h2 id="arcade-title" className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
              There’s a playable game hidden in this portfolio
            </h2>
            <p className="mx-auto max-w-2xl text-white/70 lg:mx-0">
              A neon arcade Snake I built from scratch with TypeScript and canvas — power-ups, obstacles, two modes and a
              high-score board. Plays with keyboard, touch or a gamepad.
            </p>
          </div>

          <button
            type="button"
            onClick={open}
            onFocus={preload}
            aria-haspopup="dialog"
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap border border-[#00eaff]/60 bg-[#07061a]/85 px-6 py-3.5 font-mono text-sm font-bold uppercase tracking-[0.2em] text-[#00eaff] shadow-[0_0_24px_-6px_rgba(0,234,255,0.5)] backdrop-blur-sm transition-colors after:absolute after:inset-0 after:content-[''] hover:bg-[#0b2a3a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00eaff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#07061a] group-hover:bg-[#0b2a3a]"
          >
            <Gamepad2 className="h-4 w-4 shrink-0" aria-hidden="true" />
            Press start
          </button>
        </div>

        <p className="mt-6 hidden font-mono text-[11px] uppercase tracking-[0.25em] text-white/40 sm:block">
          Psst — ↑ ↑ ↓ ↓ ← → ← → B A works anywhere on this site
        </p>
      </div>
    </Reveal>
  );
}
