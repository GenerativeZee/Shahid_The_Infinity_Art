"use client";

import { useEffect, useRef, useState } from "react";
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
 * straight onto the DOM node — never React state, so scrolling never
 * re-renders. `--reveal` is computed *synchronously* inside Lenis's own
 * scroll tick: by the time that fires, Lenis has already applied its
 * scroll transform for the frame, so `getBoundingClientRect()` is the
 * position the user is looking at right now. No extra requestAnimationFrame
 * hop — that would leave the artifact one frame behind the page and make
 * it visibly "catch up" after a fast flick (∞ iteration 9.1). Lenis's own
 * easing is the only smoothing; the artifact tracks the same eased scroll
 * position as the typography, frame for frame.
 *
 * All motion is transform / opacity / stroke-dashoffset — no layout
 * property, and deliberately no CSS transition on any of them (a temporal
 * transition on a scroll-bound property is exactly what re-creates the
 * lag). Purely decorative → aria-hidden. Reduced motion pins it to the
 * settled final composition (see globals.css).
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
  const [debug, setDebug] = useState<{ top: number; range: number; reveal: number } | null>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    if (prefersReducedMotion()) {
      wrap.style.setProperty("--reveal", "1");
      return;
    }

    const showDebug = new URLSearchParams(window.location.search).has("herodebug");
    const lenis = getLenis();

    // Cached only here + on resize — never per scroll frame. The Hero is
    // `h-dvh`, so on mobile its height changes when the URL bar shows/hides;
    // reading it every frame would silently rescale the 0→1 range while the
    // user is moving through it.
    let range = 1;
    function measure() {
      range = wrap!.getBoundingClientRect().height * 0.9 || 1;
    }

    // Synchronous — see the file header. `--reveal` is the exact eased
    // scroll position this frame, not a frame behind it.
    function update() {
      const top = wrap!.getBoundingClientRect().top;
      const p = clamp01(-top / range);
      wrap!.style.setProperty("--reveal", p.toFixed(4));
      if (showDebug) setDebug({ top: Math.round(top), range: Math.round(range), reveal: p });
    }

    function onResize() {
      measure();
      update();
    }

    measure();
    update();

    lenis?.on("scroll", update);
    window.addEventListener("resize", onResize);
    // The mobile URL bar showing/hiding changes the h-dvh height without a
    // classic resize on some browsers — re-measure on the visual viewport too.
    window.visualViewport?.addEventListener("resize", onResize);
    // Fallback only if Lenis isn't running (it always is on this site) —
    // don't leave the artifact frozen if that ever changes.
    const useNative = !lenis;
    if (useNative) window.addEventListener("scroll", update, { passive: true });

    return () => {
      lenis?.off("scroll", update);
      window.removeEventListener("resize", onResize);
      window.visualViewport?.removeEventListener("resize", onResize);
      if (useNative) window.removeEventListener("scroll", update);
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

      {/* Opt-in sync check: add ?herodebug to the URL. Verifies --reveal
          moves 0→1 over the intended range and stays locked to scroll. */}
      {debug ? (
        <output className="pointer-events-none fixed left-2 top-2 z-[200] rounded bg-black/80 px-2 py-1 font-mono text-[10px] leading-tight text-white">
          top {debug.top} · range {debug.range} · reveal {debug.reveal.toFixed(3)}
        </output>
      ) : null}
    </div>
  );
}
