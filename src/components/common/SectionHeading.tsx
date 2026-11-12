import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import Reveal from "./Reveal";

export default function SectionHeading({
  eyebrow,
  title,
  description,
  as: Heading = "h2",
  id,
  className,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  as?: "h1" | "h2";
  id?: string;
  className?: string;
}) {
  return (
    <Reveal className={cn("mb-12 flex flex-col items-center gap-4 text-center sm:items-start sm:text-start", className)}>
      {eyebrow && <span className="eyebrow">{eyebrow}</span>}
      <Heading
        id={id}
        className="max-w-3xl text-balance font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl"
      >
        {title}
      </Heading>
      {description && <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground">{description}</p>}
    </Reveal>
  );
}
