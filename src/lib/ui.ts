import { cn } from "@/lib/utils";

export type ActionVariant = "primary" | "outline" | "ghost";
export type ActionSize = "md" | "sm";

const base =
  "group/action inline-flex items-center justify-center gap-2 font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50";

const variants: Record<ActionVariant, string> = {
  primary: "border border-foreground bg-foreground text-background hover:bg-transparent hover:text-foreground",
  outline: "border border-border bg-surface/70 text-foreground hover:border-primary hover:text-primary",
  ghost: "text-muted-foreground hover:text-primary",
};

const sizes: Record<ActionSize, string> = {
  md: "px-6 py-3.5 text-sm",
  sm: "px-4 py-2 text-sm",
};

/** Shared button/link styling so router links, anchors and buttons look identical. */
export function actionClass(variant: ActionVariant = "primary", size: ActionSize = "md", className?: string) {
  return cn(base, variants[variant], sizes[size], className);
}

export const externalLinkProps = { target: "_blank", rel: "noopener noreferrer" } as const;

export const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";
