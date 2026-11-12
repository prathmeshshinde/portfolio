import { cn } from "@/lib/utils";
import { skillGroups } from "@/data/profile";
import Reveal from "@/components/common/Reveal";

export default function SkillsBento() {
  return (
    <div className="grid gap-5 md:grid-cols-3">
      {skillGroups.map((group, index) => (
        <Reveal key={group.title} delay={index * 0.06} className={cn("panel p-6 sm:p-7", group.wide && "md:col-span-2")}>
          <div className="flex items-baseline justify-between gap-3">
            <h3 className="font-display text-xl font-bold tracking-tight text-primary">{group.title}</h3>
            <span className="font-mono text-xs text-muted-foreground">{String(group.items.length).padStart(2, "0")}</span>
          </div>
          <ul className="mt-5 flex flex-wrap gap-2">
            {group.items.map((item) => (
              <li key={item} className="chip">
                {item}
              </li>
            ))}
          </ul>
        </Reveal>
      ))}
    </div>
  );
}
