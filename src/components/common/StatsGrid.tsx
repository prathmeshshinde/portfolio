import { stats } from "@/data/profile";
import CountUp from "./CountUp";
import Reveal from "./Reveal";

export default function StatsGrid() {
  return (
    <Reveal>
      <dl className="grid grid-cols-2 gap-px border border-border bg-border sm:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="flex flex-col-reverse bg-background p-6 text-center lg:p-8 lg:text-start">
            <dt className="mt-2 text-sm leading-relaxed text-muted-foreground">{stat.label}</dt>
            <dd className="font-display text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              <span className="text-gradient">
                <CountUp value={stat.value} suffix={stat.suffix} />
              </span>
            </dd>
          </div>
        ))}
      </dl>
    </Reveal>
  );
}
