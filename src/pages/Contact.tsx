import { FileText, Mail, Phone } from "lucide-react";
import { profile } from "@/data/profile";
import { useDocumentTitle } from "@/hooks/use-document-title";
import Container from "@/components/common/Container";
import PageTransition from "@/components/common/PageTransition";
import PortraitFrame from "@/components/common/PortraitFrame";
import Reveal from "@/components/common/Reveal";
import SectionHeading from "@/components/common/SectionHeading";
import SocialLinks from "@/components/common/SocialLinks";
import ContactRow from "@/components/contact/ContactRow";

export default function Contact() {
  useDocumentTitle("Contact");

  return (
    <PageTransition>
      <section className="pb-24 pt-10 sm:pt-16">
        <Container>
          <div className="grid grid-cols-1 items-stretch gap-8 lg:grid-cols-[0.95fr_1.05fr]">
            <aside className="flex flex-col gap-4">
              <Reveal>
                <PortraitFrame caption="say-hello.png" imgClassName="h-64 object-contain sm:h-80 lg:h-[22rem]" eager />
              </Reveal>
              <Reveal delay={0.08} className="panel flex-1 space-y-4 p-6">
                <p className="inline-flex items-center gap-2.5 border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-foreground">
                  <span className="status-dot" aria-hidden="true" />
                  {profile.availability.label}
                </p>
                <div>
                  <p className="font-display text-2xl font-bold tracking-tight">{profile.name}</p>
                  <p className="mt-1.5 text-sm text-muted-foreground">{profile.role}</p>
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">{profile.availability.note}</p>
              </Reveal>
            </aside>

            <Reveal delay={0.05} className="panel p-6 sm:p-8">
              <SectionHeading
                as="h1"
                eyebrow="Get in touch"
                title="Contact"
                description="Let’s talk about your project — email or call, or find me on the socials below."
                className="mb-8"
              />
              <div className="grid gap-3">
                <ContactRow
                  icon={Mail}
                  label="Email"
                  value={profile.email}
                  href={`mailto:${profile.email}`}
                  copyValue={profile.email}
                />
                <ContactRow
                  icon={Phone}
                  label="Phone"
                  value={profile.phone.display}
                  href={profile.phone.href}
                  copyValue={profile.phone.display}
                />
                <ContactRow icon={FileText} label="Resume" value="View on Google Drive" href={profile.resumeUrl} external />
              </div>
              <p className="mt-8 text-sm font-semibold text-foreground">Social</p>
              <SocialLinks className="mt-3" />
            </Reveal>
          </div>
        </Container>
      </section>
    </PageTransition>
  );
}
