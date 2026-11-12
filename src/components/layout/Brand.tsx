import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { profile } from "@/data/profile";

export default function Brand({ className, onClick }: { className?: string; onClick?: () => void }) {
  return (
    <Link
      to="/"
      onClick={onClick}
      aria-label={`${profile.name} — home`}
      className={cn("group min-w-0 leading-tight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", className)}
    >
      <span className="block truncate font-display text-sm font-bold tracking-tight transition-colors group-hover:text-primary">
        {profile.logotype}
      </span>
      <span className="block truncate text-xs text-muted-foreground">{profile.role}</span>
    </Link>
  );
}
