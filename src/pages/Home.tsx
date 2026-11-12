import { useDocumentTitle } from "@/hooks/use-document-title";
import PageTransition from "@/components/common/PageTransition";
import Section from "@/components/common/Section";
import StatsGrid from "@/components/common/StatsGrid";
import CtaPanel from "@/components/common/CtaPanel";
import Hero from "@/components/home/Hero";
import ArcadeBanner from "@/components/home/ArcadeBanner";
import Services from "@/components/home/Services";
import OnlineWork from "@/components/home/OnlineWork";

export default function Home() {
  useDocumentTitle();

  return (
    <PageTransition>
      <Hero />
      <Section className="pt-0 sm:pt-4 lg:pt-6" labelledBy="stats-title">
        <h2 id="stats-title" className="sr-only">
          At a glance
        </h2>
        <StatsGrid />
      </Section>
      <Section labelledBy="arcade-title">
        <ArcadeBanner />
      </Section>
      <Section labelledBy="services-title">
        <Services />
      </Section>
      <Section labelledBy="work-title">
        <OnlineWork />
      </Section>
      <CtaPanel />
    </PageTransition>
  );
}
