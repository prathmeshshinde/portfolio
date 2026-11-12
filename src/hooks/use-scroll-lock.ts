import { useEffect } from "react";

let lockCount = 0;
let saved: { overflow: string; paddingRight: string } | null = null;

function lock() {
  lockCount += 1;
  if (lockCount > 1) return;
  const { body, documentElement } = document;
  saved = { overflow: body.style.overflow, paddingRight: body.style.paddingRight };
  const scrollbar = window.innerWidth - documentElement.clientWidth;
  body.style.overflow = "hidden";
  if (scrollbar > 0) body.style.paddingRight = `${scrollbar}px`;
}

function unlock() {
  lockCount = Math.max(0, lockCount - 1);
  if (lockCount > 0 || !saved) return;
  document.body.style.overflow = saved.overflow;
  document.body.style.paddingRight = saved.paddingRight;
  saved = null;
}

/** Prevents the page behind an overlay from scrolling. Safe to use from several overlays at once. */
export function useScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return;
    lock();
    return unlock;
  }, [active]);
}
