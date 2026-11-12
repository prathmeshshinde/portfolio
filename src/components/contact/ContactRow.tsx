import { useEffect, useState } from "react";
import { ArrowUpRight, Check, Copy, type LucideIcon } from "lucide-react";
import { toast } from "sonner";
import { externalLinkProps } from "@/lib/ui";

function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(timer);
  }, [copied]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success(`${label} copied to clipboard`);
    } catch {
      toast.error("Couldn’t copy automatically — please copy it manually.");
    }
  };

  const text = `Copy ${label.toLowerCase()}`;
  return (
    <button
      type="button"
      onClick={copy}
      aria-label={text}
      title={text}
      className="grid w-14 shrink-0 place-items-center border-s border-border text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
    >
      {copied ? <Check className="h-4 w-4 text-primary" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
    </button>
  );
}

export default function ContactRow({
  icon: Icon,
  label,
  value,
  href,
  copyValue,
  external = false,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  href: string;
  copyValue?: string;
  external?: boolean;
}) {
  return (
    <div className="group flex items-stretch border border-border bg-surface/60 transition-colors focus-within:border-primary hover:border-primary">
      <a
        href={href}
        {...(external ? externalLinkProps : {})}
        className="flex min-w-0 flex-1 items-center gap-4 px-5 py-4 focus-visible:outline-none"
      >
        <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center border border-border bg-card text-primary transition-colors group-hover:border-primary">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        <span className="min-w-0">
          <span className="block text-xs font-semibold text-muted-foreground">{label}</span>
          <span className="mt-1 block text-base font-medium text-foreground [overflow-wrap:anywhere]">{value}</span>
        </span>
        {external && (
          <ArrowUpRight
            className="ms-auto h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary"
            aria-hidden="true"
          />
        )}
      </a>
      {copyValue && <CopyButton value={copyValue} label={label} />}
    </div>
  );
}
