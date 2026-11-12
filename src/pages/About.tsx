import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { about, profile } from "@/data/profile";
import { actionClass, externalLinkProps } from "@/lib/ui";
import { useDocumentTitle } from "@/hooks/use-document-title";
import Container from "@/components/common/Container";
import CtaPanel from "@/components/common/CtaPanel";
import PageTransition from "@/components/common/PageTransition";
import PortraitFrame from "@/components/common/PortraitFrame";
import Reveal from "@/components/common/Reveal";
import Section from "@/components/common/Section";
import SectionHeading from "@/components/common/SectionHeading";
import StatsGrid from "@/components/common/StatsGrid";
import ExperienceTimeline from "@/components/about/ExperienceTimeline";
import SkillsBento from "@/components/about/SkillsBento";

export default function About() {
  useDocumentTitle("About");

  return (
    <PageTransition>
      <section className="pb-12 pt-10 sm:pb-20 sm:pt-16">
        <Container>
          <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
            <Reveal className="mx-auto w-full max-w-sm lg:sticky lg:top-24 lg:max-w-none">
              <PortraitFrame eager />
            </Reveal>

            <div className="space-y-8 text-center sm:text-start">
              <SectionHeading as="h1" eyebrow="About me" title={profile.name} description={about.intro} className="mb-0" />
              <Reveal delay={0.1} className="space-y-4 text-base leading-relaxed text-muted-foreground">
                {about.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </Reveal>
              <Reveal delay={0.15} className="flex flex-wrap justify-center gap-3 sm:justify-start">
                <Link to="/contact" className={actionClass("primary")}>
                  Get in touch
                  <ArrowRight className="h-4 w-4 transition-transform group-hover/action:translate-x-0.5" aria-hidden="true" />
                </Link>
                <a href={profile.resumeUrl} {...externalLinkProps} className={actionClass("outline")}>
                  View resume
                  <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                </a>
              </Reveal>
            </div>
          </div>
        </Container>
      </section>

      <Section className="pt-0 sm:pt-0 lg:pt-0" labelledBy="about-stats-title">
        <h2 id="about-stats-title" className="sr-only">
          At a glance
        </h2>
        <StatsGrid />
      </Section>

      <Section labelledBy="experience-title">
        <SectionHeading id="experience-title" eyebrow="Career" title="Work experience" />
        <ExperienceTimeline />
      </Section>

      <Section labelledBy="skills-title">
        <SectionHeading
          id="skills-title"
          eyebrow="Toolkit"
          title="Skills"
          description="The languages, libraries and tools I reach for every day."
        />
        <SkillsBento />
      </Section>

      <CtaPanel />
    </PageTransition>
  );
}
