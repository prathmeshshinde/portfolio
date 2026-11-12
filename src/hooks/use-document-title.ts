import { useEffect } from "react";
import { profile } from "@/data/profile";

/** Sets the tab title, e.g. "About — Prathmesh Shinde". */
export function useDocumentTitle(page?: string) {
  useEffect(() => {
    document.title = page ? `${page} — ${profile.name}` : `${profile.name} — ${profile.role}`;
  }, [page]);
}
