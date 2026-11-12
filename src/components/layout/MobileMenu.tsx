import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { NavLink } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { actionClass, externalLinkProps } from "@/lib/ui";
import { navigation, profile } from "@/data/profile";
import { useScrollLock } from "@/hooks/use-scroll-lock";
import { useFocusTrap } from "@/hooks/use-focus-trap";
import Brand from "./Brand";
import ThemeSwitch from "./ThemeSwitch";
import SocialLinks from "@/components/common/SocialLinks";

export default function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useScrollLock(open);
  useFocusTrap(panelRef, open);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    // Close automatically if the viewport grows into the desktop layout.
    const desktop = window.matchMedia("(min-width: 1024px)");
    const onResize = (event: MediaQueryListEvent) => {
      if (event.matches) onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    desktop.addEventListener("change", onResize);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      desktop.removeEventListener("change", onResize);
    };
  }, [open, onClose]);

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          ref={panelRef}
          id="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="fixed inset-0 z-[60] flex flex-col overflow-y-auto bg-background lg:hidden"
        >
          <div className="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-border px-5">
            <Brand onClick={onClose} />
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              aria-label="Close menu"
              className="inline-flex h-9 w-9 items-center justify-center border border-border text-foreground transition-colors hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          <nav aria-label="Mobile" className="flex flex-col">
            {navigation.map((item, index) => (
              <motion.div
                key={item.to}
                initial={{ opacity: 0, x: -14 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 + index * 0.06, duration: 0.3, ease: "easeOut" }}
              >
                <NavLink
                  to={item.to}
                  end={item.to === "/"}
                  onClick={onClose}
                  className={({ isActive }) =>
                    cn(
                      "flex items-baseline gap-4 border-b border-border px-5 py-5 font-display text-3xl font-bold tracking-tight transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
                      isActive ? "text-primary" : "text-foreground hover:text-primary",
                    )
                  }
                >
                  <span className="font-mono text-xs font-medium text-muted-foreground">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  {item.label}
                </NavLink>
              </motion.div>
            ))}
          </nav>

          <div className="mt-auto space-y-6 px-5 py-8">
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-muted-foreground">Theme</span>
              <ThemeSwitch />
            </div>
            <SocialLinks />
            <a href={profile.resumeUrl} {...externalLinkProps} className={actionClass("outline", "md", "w-full")}>
              View resume
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
