import { services } from "@/data/profile";
import Reveal from "@/components/common/Reveal";
import SectionHeading from "@/components/common/SectionHeading";

export default function Services() {
  return (
    <>
      <SectionHeading
        id="services-title"
        eyebrow="What I do"
        title="Detail-driven frontend, built to last"
        description="From Figma file to production — interfaces that are fast, accessible, and easy to maintain."
      />
      <ol className="divide-y divide-border border-y border-border">
        {services.map((service, index) => (
          <Reveal
            as="li"
            key={service.title}
            delay={index * 0.06}
            className="group grid grid-cols-1 gap-2 py-8 sm:grid-cols-[3rem_1fr_2fr] sm:items-baseline sm:gap-10"
          >
            <span className="font-mono text-xs text-primary">{String(index + 1).padStart(2, "0")}</span>
            <h3 className="font-display text-xl font-bold tracking-tight transition-transform duration-300 group-hover:translate-x-1 sm:text-2xl">
              {service.title}
            </h3>
            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">{service.description}</p>
          </Reveal>
        ))}
      </ol>
    </>
  );
}
