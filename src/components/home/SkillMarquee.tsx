import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";
import { marqueeSkills } from "@/data/profile";

/** Each skill adds this much to one loop, so the scroll speed stays the same however many skills are listed. */
const SECONDS_PER_SKILL = 2.7;

/** Endless scrolling row of skills. Pauses on hover; becomes a static wrap with reduced motion. */
export default function SkillMarquee({ className }: { className?: string }) {
  const items = [...marqueeSkills, ...marqueeSkills];
  return (
    <div className={cn("border-y border-border py-5", className)}>
      <div className="marquee-mask relative overflow-hidden">
        <ul
          className="marquee-track flex w-max gap-3"
          aria-label="Skills"
          style={{ "--marquee-duration": `${marqueeSkills.length * SECONDS_PER_SKILL}s` } as CSSProperties}
        >
          {items.map((skill, index) => {
            const clone = index >= marqueeSkills.length;
            return (
              <li
                key={`${skill}-${index}`}
                aria-hidden={clone || undefined}
                data-clone={clone || undefined}
                className="inline-flex shrink-0 items-center gap-2 border border-border bg-surface px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary"
              >
                <span aria-hidden="true" className="h-1.5 w-1.5 bg-primary" />
                {skill}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
