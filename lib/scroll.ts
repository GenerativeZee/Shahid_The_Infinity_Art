"use client";

import Lenis from "lenis";

let lenis: Lenis | null = null;
let rafId: number | null = null;

/**
 * A light lerp, deliberately. Lenis's default smoothing fights the
 * requirement that a hard flick shoots straight past the 300dvh hero with
 * no resistance (§6, §16) — keeping the lerp close to 1 (little smoothing)
 * preserves that while still taking the harsh edge off normal scrolling.
 * See DECISIONS.md.
 */
export function getLenis(): Lenis | null {
  if (typeof window === "undefined") return null;
  if (lenis) return lenis;

  lenis = new Lenis({ lerp: 0.85 });

  function raf(time: number) {
    lenis?.raf(time);
    rafId = requestAnimationFrame(raf);
  }
  rafId = requestAnimationFrame(raf);

  return lenis;
}

export function destroyLenis() {
  if (rafId !== null) cancelAnimationFrame(rafId);
  lenis?.destroy();
  lenis = null;
  rafId = null;
}
