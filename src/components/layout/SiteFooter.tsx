import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowUp, Gamepad2 } from "lucide-react";
import { navigation, profile } from "@/data/profile";
import { externalLinkProps } from "@/lib/ui";
import { useGame } from "@/hooks/use-game";
import Container from "@/components/common/Container";
import SocialLinks from "@/components/common/SocialLinks";

const linkClass =
  "transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

function FooterColumn({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="space-y-3 text-center sm:text-start">
      <p className="font-semibold text-foreground">{title}</p>
      <div className="flex flex-col items-center gap-2 text-muted-foreground sm:items-start">{children}</div>
    </div>
  );
}

export default function SiteFooter() {
  const { open: openGame, preload } = useGame();
  const year = new Date().getFullYear();

  return (
    <footer className="relative border-t border-border bg-surface/50">
      <Container className="grid grid-cols-1 gap-10 py-14 md:grid-cols-[1.2fr_1fr]">
        <div className="space-y-4 text-center md:text-start">
          <Link
            to="/"
            aria-label={`${profile.name} — home`}
            className="inline-block font-display text-2xl font-bold tracking-tight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="text-gradient">{profile.logotype}</span>
          </Link>
          <p className="mx-auto max-w-md text-sm leading-relaxed text-muted-foreground md:mx-0">{profile.footerTagline}</p>
          <SocialLinks className="justify-center md:justify-start" />
        </div>

        <div className="grid grid-cols-2 gap-6 text-sm">
          <FooterColumn title="Navigation">
            {navigation.map((item) => (
              <Link key={item.to} to={item.to} className={linkClass}>
                {item.label}
              </Link>
            ))}
            <button
              type="button"
              onClick={openGame}
              onPointerEnter={preload}
              onFocus={preload}
              className={`${linkClass} inline-flex items-center gap-1.5`}
            >
              <Gamepad2 className="h-3.5 w-3.5" aria-hidden="true" /> Play Snake
            </button>
          </FooterColumn>

          <FooterColumn title="Connect">
            <a href={`mailto:${profile.email}`} className={`${linkClass} break-all`}>
              {profile.email}
            </a>
            <a href={profile.phone.href} className={linkClass}>
              {profile.phone.display}
            </a>
            <a href={profile.github.url} {...externalLinkProps} className={linkClass}>
              GitHub
            </a>
            <a href={profile.linkedin} {...externalLinkProps} className={linkClass}>
              LinkedIn
            </a>
            <a href={profile.resumeUrl} {...externalLinkProps} className={linkClass}>
              Resume
            </a>
          </FooterColumn>
        </div>
      </Container>

      <div className="border-t border-border">
        <Container className="flex flex-col items-center justify-between gap-3 py-5 text-sm text-muted-foreground sm:flex-row">
          <p>
            © {year} {profile.name}. All rights reserved.
          </p>
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className={`${linkClass} inline-flex items-center gap-1.5`}
          >
            Back to top <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </Container>
      </div>
    </footer>
  );
}
