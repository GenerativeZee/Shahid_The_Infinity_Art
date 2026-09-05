"use client";

import { useEffect, useRef } from "react";
import { getLenis } from "@/lib/scroll";
import { prefersReducedMotion } from "@/lib/tier";

/**
 * The Hero's fabricated artifact (∞ iteration 9 — replaces the day/night
 * mask reveal). One bent strip of signage material with visible thickness,
 * a lit cut edge and a contact shadow, revealed as the visitor scrolls the
 * Hero out of view: a stroke-dash "draw" for the form, stacked offset
 * strokes for depth, one group transform for the turn into place. It is
 * the first physical object of the exhibition — the vocabulary Shahid's
 * Eye, Process and Build It then work with.
 *
 * Not a literal ∞: the path folds back on itself, leaving an inner cavity,
 * the way a folded strip of ACP would.
 *
 * Scroll drives it through a single CSS variable (`--reveal`, 0→1) written
 * on the existing Lenis tick, rAF-throttled, straight onto the DOM node —
 * never React state, so scrolling never re-renders. All motion is
 * transform / opacity / stroke-dashoffset; no layout property is touched.
 * Purely decorative → aria-hidden. Reduced motion pins it to the settled
 * final composition (see globals.css).
 */

// Same object, two framings — landscape sweep on desktop, vertical rise on
// a phone (the brief explicitly allows different geometry per viewport).
const PATH_DESKTOP =
  "M 60 640 C 320 620 380 300 620 300 C 860 300 900 520 720 560 C 560 596 520 420 640 380";
const PATH_MOBILE =
  "M 360 800 C 520 660 460 420 640 380 C 820 340 820 560 660 600 C 520 632 520 460 620 440";

const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);

function RibbonPaths({ d }: { d: string }) {
  // Order = paint order, back to front: shadow, cut edge, face, face
  // texture, lit highlight. Each carries a small static offset (SVG
  // transform attribute, unambiguous in user units) to fake thickness
  // toward the bottom-right, consistent with light from the top-left.
  return (
    <g className="hero-ribbon__group">
      <path className="hero-ribbon__shadow" d={d} pathLength={1} transform="translate(16 22)" />
      <path className="hero-ribbon__edge" d={d} pathLength={1} transform="translate(7 10)" />
      <path className="hero-ribbon__face" d={d} pathLength={1} />
      <path className="hero-ribbon__tex" d={d} pathLength={1} />
      <path className="hero-ribbon__highlight" d={d} pathLength={1} transform="translate(-3 -4)" />
    </g>
  );
}

export function HeroRibbon() {
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    if (prefersReducedMotion()) {
      wrap.style.setProperty("--reveal", "1");
      return;
    }

    const lenis = getLenis();
    let rafId: number | null = null;

    function apply() {
      rafId = null;
      if (!wrap) return;
      const rect = wrap.getBoundingClientRect();
      // 0 while the Hero fills the viewport → 1 once ~90% of it has
      // scrolled past the top edge. A hard flick just clamps to 1.
      const p = clamp01(-rect.top / (rect.height * 0.9));
      wrap.style.setProperty("--reveal", p.toFixed(4));
    }

    function onScroll() {
      if (rafId === null) rafId = requestAnimationFrame(apply);
    }

    apply();
    lenis?.on("scroll", onScroll);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      lenis?.off("scroll", onScroll);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div
      ref={wrapRef}
      aria-hidden="true"
      className="hero-ribbon pointer-events-none absolute inset-0 overflow-hidden"
    >
      {/* Shared pattern — a zero-size svg always in the DOM, so url(#…)
          resolves for whichever framing is visible at the breakpoint. */}
      <svg width="0" height="0" className="absolute">
        <defs>
          <pattern
            id="hero-ribbon-hatch"
            width="10"
            height="10"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(45)"
          >
            <line x1="0" y1="0" x2="0" y2="10" stroke="var(--color-accent)" strokeWidth="1.5" />
          </pattern>
        </defs>
      </svg>

      <svg
        className="hero-ribbon__svg hidden md:block"
        viewBox="0 0 1200 800"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
      >
        <RibbonPaths d={PATH_DESKTOP} />
      </svg>

      <svg
        className="hero-ribbon__svg md:hidden"
        viewBox="0 0 1200 800"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
      >
        <RibbonPaths d={PATH_MOBILE} />
      </svg>
    </div>
  );
}
