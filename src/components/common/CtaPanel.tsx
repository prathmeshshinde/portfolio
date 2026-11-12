import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { profile } from "@/data/profile";
import { actionClass, externalLinkProps } from "@/lib/ui";
import Container from "./Container";
import Reveal from "./Reveal";

export default function CtaPanel() {
  return (
    <section aria-labelledby="cta-title" className="pb-24 pt-8 sm:pt-12">
      <Container>
        <Reveal className="relative isolate overflow-hidden border border-border p-8 sm:p-12">
          <div aria-hidden="true" className="bg-grid mask-fade-end absolute inset-0 -z-10 opacity-60" />
          <div aria-hidden="true" className="absolute -right-24 -top-24 -z-10 h-72 w-72 rounded-full bg-primary/15 blur-3xl" />
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="space-y-3 text-center lg:text-start">
              <span className="eyebrow">Let’s talk</span>
              <h2 id="cta-title" className="text-balance font-display text-3xl font-bold tracking-tight sm:text-4xl">
                Ready to work together?
              </h2>
              <p className="mx-auto max-w-2xl text-muted-foreground lg:mx-0">
                I’m currently available for freelance work and full-time positions. If you’re looking for a developer who
                cares about the details, let’s connect!
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              <Link to="/contact" className={actionClass("primary")}>
                Get in touch
                <ArrowRight className="h-4 w-4 transition-transform group-hover/action:translate-x-0.5" aria-hidden="true" />
              </Link>
              <a href={profile.resumeUrl} {...externalLinkProps} className={actionClass("outline")}>
                Resume
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </a>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
