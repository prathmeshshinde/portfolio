import { Link, useLocation } from "react-router-dom";
import { ArrowLeft, Gamepad2 } from "lucide-react";
import { actionClass } from "@/lib/ui";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { useGame } from "@/hooks/use-game";
import Container from "@/components/common/Container";
import PageTransition from "@/components/common/PageTransition";

export default function NotFound() {
  useDocumentTitle("Page not found");
  const { pathname } = useLocation();
  const { open, preload } = useGame();

  return (
    <PageTransition>
      <section className="relative isolate overflow-hidden">
        <div aria-hidden="true" className="bg-grid mask-fade-top pointer-events-none absolute inset-0 -z-10" />
        <Container className="flex min-h-[70vh] flex-col items-center justify-center gap-6 py-24 text-center">
          <span className="eyebrow">Error 404</span>
          <h1 className="font-display text-8xl font-bold tracking-tight sm:text-9xl">
            <span className="text-gradient">404</span>
          </h1>
          <p className="max-w-md text-lg leading-relaxed text-muted-foreground">
            Nothing lives at <code className="break-all font-mono text-base text-foreground">{pathname}</code> — this page
            slithered off the grid.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/" className={actionClass("primary")}>
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back home
            </Link>
            <button
              type="button"
              onClick={open}
              onPointerEnter={preload}
              onFocus={preload}
              aria-haspopup="dialog"
              className={actionClass("outline")}
            >
              <Gamepad2 className="h-4 w-4" aria-hidden="true" />
              Play Snake instead
            </button>
          </div>
        </Container>
      </section>
    </PageTransition>
  );
}
