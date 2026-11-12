import { ExternalLink, MapPin } from "lucide-react";
import { experience } from "@/data/profile";
import { externalLinkProps } from "@/lib/ui";
import Reveal from "@/components/common/Reveal";

const pad = (n: number) => String(n).padStart(2, "0");

/** Renders `**phrase**` segments in bold, like the highlighted metrics on the résumé. */
function Highlight({ text }: { text: string }) {
  return (
    <>
      {text.split("**").map((part, index) =>
        index % 2 === 1 ? (
          <strong key={index} className="font-semibold text-foreground">
            {part}
          </strong>
        ) : (
          part
        ),
      )}
    </>
  );
}

export default function ExperienceTimeline() {
  return (
    <ol className="relative space-y-10">
      <span aria-hidden="true" className="absolute bottom-2 start-[5px] top-2 hidden w-px bg-border sm:block" />
      {experience.map((job, index) => (
        <li key={`${job.company}-${job.period}`} className="relative grid grid-cols-1 gap-4 sm:grid-cols-[11rem_1fr] sm:gap-8 lg:grid-cols-[13rem_1fr]">
          {/* Timeline rail: dot + dates (tablet and up) */}
          <div className="hidden sm:block">
            <span aria-hidden="true" className="absolute start-0 top-7 h-[11px] w-[11px] bg-primary ring-4 ring-background" />
            <div className="sticky top-24 ps-8 pt-5">
              <p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-primary">{pad(index + 1)}</p>
              <p className="mt-2 text-sm font-medium text-foreground">{job.period}</p>
              <p className="mt-1 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                {job.location}
              </p>
            </div>
          </div>

          <Reveal className="panel p-6 sm:p-8">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3 sm:hidden">
              <span className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-primary">{pad(index + 1)}</span>
              <span className="border border-border bg-surface px-2 py-0.5 text-xs text-muted-foreground">{job.period}</span>
            </div>
            <h3 className="font-display text-2xl font-bold tracking-tight">{job.company}</h3>
            <p className="mt-1 text-muted-foreground">
              {job.role}
              <span className="sm:hidden"> · {job.location}</span>
            </p>

            <ul className="mt-5 space-y-3 text-sm leading-relaxed text-muted-foreground">
              {job.highlights.map((highlight) => (
                <li key={highlight} className="relative ps-5">
                  <span aria-hidden="true" className="absolute start-0 top-[0.6em] h-1.5 w-1.5 bg-primary/70" />
                  <Highlight text={highlight} />
                </li>
              ))}
            </ul>

            {job.stack && (
              <ul aria-label="Technologies used" className="mt-6 flex flex-wrap gap-2">
                {job.stack.map((tech) => (
                  <li key={tech} className="border border-border bg-surface px-2.5 py-1 text-xs text-muted-foreground">
                    {tech}
                  </li>
                ))}
              </ul>
            )}

            {job.url && (
              <a
                href={job.url}
                {...externalLinkProps}
                className="mt-5 inline-flex items-center gap-1.5 text-sm text-primary transition-opacity hover:opacity-80"
              >
                {new URL(job.url).hostname.replace(/^www\./, "")}
                <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            )}
          </Reveal>
        </li>
      ))}
    </ol>
  );
}
