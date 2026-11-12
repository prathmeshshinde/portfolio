import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { profile } from "@/data/profile";
import { actionClass, externalLinkProps } from "@/lib/ui";
import Container from "@/components/common/Container";
import CodeWindow from "./CodeWindow";
import SkillMarquee from "./SkillMarquee";

const ease = [0.22, 1, 0.36, 1] as const;

export default function Hero() {
  return (
    <section aria-labelledby="hero-title" className="relative isolate overflow-hidden">
      <div aria-hidden="true" className="bg-grid mask-fade-top pointer-events-none absolute inset-0 -z-10" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-56 left-1/2 -z-10 h-[34rem] w-[min(68rem,140vw)] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl"
      />

      <Container className="pb-12 pt-10 sm:pt-16 lg:pb-16">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease }}
            className="space-y-8 text-center lg:space-y-10 lg:text-start"
          >
            <div className="space-y-5">
              <p className="inline-flex items-center gap-2.5 border border-border bg-surface/70 px-3 py-1.5 text-xs font-medium text-muted-foreground">
                <span className="status-dot" aria-hidden="true" />
                {profile.availability.label} · {profile.availability.detail}
              </p>
              <h1
                id="hero-title"
                className="font-display text-5xl font-bold leading-[0.95] tracking-tight text-foreground sm:text-6xl lg:text-7xl xl:text-[5.5rem]"
              >
                {profile.name}
              </h1>
              <p className="text-xl font-medium leading-relaxed text-foreground sm:text-2xl">
                {profile.role} <span className="text-muted-foreground">· React &amp; TypeScript</span>
              </p>
              <p className="mx-auto max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg lg:mx-0">
                {profile.summary}
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-3 lg:justify-start">
              <Link to="/contact" className={actionClass("primary")}>
                Get in touch
                <ArrowRight className="h-4 w-4 transition-transform group-hover/action:translate-x-0.5" aria-hidden="true" />
              </Link>
              <a href={profile.resumeUrl} {...externalLinkProps} className={actionClass("outline")}>
                View resume
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </a>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease }}
            className="hidden lg:block"
          >
            <CodeWindow />
          </motion.div>
        </div>

        <SkillMarquee className="mt-14 lg:mt-20" />
      </Container>
    </section>
  );
}
