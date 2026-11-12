import Container from "./Container";

/** Shown while a page's code is loading. */
export default function PageSkeleton() {
  return (
    <Container className="py-16">
      <div className="space-y-8" aria-busy="true" aria-live="polite">
        <span className="sr-only">Loading…</span>
        <div className="h-3 w-24 animate-pulse bg-border" />
        <div className="space-y-3">
          <div className="h-10 w-3/4 max-w-md animate-pulse bg-surface" />
          <div className="h-4 w-full max-w-xl animate-pulse bg-border" />
          <div className="h-4 w-5/6 max-w-lg animate-pulse bg-border" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="h-40 animate-pulse border border-border bg-surface" />
          <div className="h-40 animate-pulse border border-border bg-surface" />
        </div>
      </div>
    </Container>
  );
}
