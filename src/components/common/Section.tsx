import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import Container from "./Container";

export default function Section({
  children,
  className,
  id,
  labelledBy,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
  labelledBy?: string;
}) {
  return (
    <section id={id} aria-labelledby={labelledBy} className={cn("py-12 sm:py-20 lg:py-24", className)}>
      <Container>{children}</Container>
    </section>
  );
}
