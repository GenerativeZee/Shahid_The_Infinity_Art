"use client";

import { type CSSProperties, useEffect, useRef, useState } from "react";
import { getLenis } from "@/lib/scroll";
import { prefersReducedMotion } from "@/lib/tier";

/**
 * The Hero identity reveal (∞ iteration 11) — the "iA" logo mark unfolds
 * into the wordmark "THE INFINITY ART". The mark's monoline strokes are
 * the visible cause of the name: they separate, rotate toward horizontal,
 * stretch and travel right, and the wordmark is written in their wake —
 * an overlap handoff where you can't pin the frame the logo became text.
 * "i" and "A" are literally the initials — Infinity, Art — opening into
 * the full name.
 *
 *   ~0.00–0.13  presence     the real mark.png alone, recognised
 *   ~0.13–0.22  (cross-fade)  the raster mark hands to an SVG monoline copy
 *   ~0.18–0.34  separation    the strokes open under tension
 *   ~0.34–0.50  extension     they flatten to horizontal writing lines
 *   ~0.46–0.72  writing       a left→right mask opens the wordmark in step
 *   ~0.68–0.86  identity      "THE INFINITY ART" resolves; strokes dissolve
 *   ~0.84–1.00  settle        one residual accent rule under "ART"; calm
 *
 * This component owns only the progress value. Everything visual is a
 * plain calc() of `--reveal` in globals.css (`.hero-mark*`), so stopping
 * anywhere is a composed frame.
 *
 * Scroll model (kept verbatim from ∞ 9.1 + 10.1): the Hero is pinned
 * (`.hero-scroll` is 220dvh, `.hero-scroll__pin` is sticky). `--reveal`
 * (0→1) is measured against the tall section — not this element, which
 * stays at viewport top while pinned — and written *synchronously* inside
 * Lenis's own scroll tick, onto `.hero-scroll__pin` so the ambient wash
 * and the wordmark both inherit it. No requestAnimationFrame hop (that
 * caused the "catch-up" bug), no React state in the scroll path, no CSS
 * transition on any scroll-bound property — Lenis's easing is the only
 * smoothing. `--reveal` hits 1 at ~90% of the pin so the finished
 * wordmark is held for a beat. Reduced motion pins it to 1: the settled
 * composition, static.
 */

const WORDMARK = "The Infinity Art";
const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);

// Eight near-horizontal light streaks, gently raked up-right, staggered
// across the band the wordmark occupies. Each carries one palette tone;
// they draw on from the left and streak off right as --reveal advances
// (a stroke-dash offset), peak through Disassembly/Translation, and are
// nearly gone by Identity. viewBox 1400×460.
const TRAILS = [
  "M -180 250 Q 520 232 1500 176",
  "M -180 300 Q 520 286 1500 214",
  "M -180 205 Q 520 180 1500 120",
  "M -180 340 Q 520 330 1500 262",
  "M -180 168 Q 520 138 1500 86",
  "M -180 268 Q 520 250 1500 150",
  "M -180 224 Q 520 206 1500 196",
  "M -180 312 Q 520 300 1500 238",
];
const TRAIL_TONES = ["gold", "cool", "violet", "cyan", "rose", "gold", "cyan", "cool"] as const;

export function HeroMark() {
  const ref = useRef<HTMLHeadingElement>(null);
  const [debug, setDebug] = useState<{ top: number; range: number; reveal: number } | null>(null);

  useEffect(() => {
    const h1 = ref.current;
    if (!h1) return;

    const section = (h1.closest(".hero-scroll") as HTMLElement | null) ?? h1;
    // Written on <body> (not .hero-scroll__pin) so the fixed nav — a
    // sibling of <main>, not a descendant of the pin — can also read
    // --reveal and recede during the transformation. @property --reveal
    // inherits, so .hero-scroll__pin and its sub-progress vars still pick
    // it up. No second listener; this is the same synchronous write.
    const host = document.body;

    if (prefersReducedMotion()) {
      host.style.setProperty("--reveal", "1");
      return;
    }

    const showDebug = new URLSearchParams(window.location.search).has("herodebug");
    const lenis = getLenis();

    // Cached here + on resize only — never per scroll frame. Heights are in
    // dvh; reading the range every frame would rescale progress mid-scroll
    // as the mobile URL bar shows/hides.
    let range = 1;
    function measure() {
      const dist = (section.getBoundingClientRect().height - window.innerHeight) * 0.9;
      range = dist > 0 ? dist : 1;
    }

    function update() {
      const top = section.getBoundingClientRect().top;
      const p = clamp01(-top / range);
      host.style.setProperty("--reveal", p.toFixed(4));
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
    window.visualViewport?.addEventListener("resize", onResize);
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
    <h1 ref={ref} className="hero-mark">
      {/* FX layer — multi-colour speed trails + settle-persistent arcs of
          light, spanning the full wordmark width, behind everything. */}
      <svg
        aria-hidden="true"
        className="hero-mark__fx"
        viewBox="0 0 1400 460"
        fill="none"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Fabrication frame — a datum line + two registration marks that
            resolve only as the identity locks, so the settled composition
            reads as "designed and made here", not an empty canvas. */}
        <g className="hero-mark__frame">
          <line x1="36" y1="304" x2="1364" y2="304" strokeDasharray="2 11" />
          <path d="M 112 70 h 22 M 123 59 v 22" />
          <path d="M 1266 392 h 22 M 1277 381 v 22" />
        </g>
        <g className="hero-mark__arcs">
          <path className="hero-mark__arc hero-mark__arc--cool" d="M -240 430 Q 460 250 1640 90" />
          <path className="hero-mark__arc hero-mark__arc--violet" d="M -160 60 Q 720 210 1720 380" />
          <path className="hero-mark__arc hero-mark__arc--rose" d="M 280 470 Q 980 320 1780 210" />
        </g>
        <g className="hero-mark__trails">
          {TRAILS.map((d, i) => (
            <path
              key={i}
              className={`hero-mark__trail hero-mark__trail--${TRAIL_TONES[i]}`}
              style={{ "--i": i } as CSSProperties}
              d={d}
              pathLength={1}
            />
          ))}
        </g>
      </svg>

      <span aria-hidden="true" className="hero-mark__art">
        {/* Presence — the real logo mark, then it hands off to the SVG.
            Both fill the same box so the cross-fade is position-aligned. */}
        <span className="hero-mark__png" />

        <svg
          className="hero-mark__svg"
          viewBox="0 0 1000 642"
          fill="none"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Two monoline strokes, each a dark offset "shadow" copy plus a
              body copy. As they separate they rake right and stretch into
              thin streaks; the body colours mix the gold anchor toward one
              material tone — V catches cool light, A catches warm. */}
          <g className="hero-mark__stroke hero-mark__stroke--v">
            <path className="hero-mark__stroke-sh" d="M 110 210 L 290 540 L 460 175" />
            <path className="hero-mark__stroke-body hero-mark__stroke-body--v" d="M 110 210 L 290 540 L 460 175" />
          </g>
          <g className="hero-mark__stroke hero-mark__stroke--a">
            <path className="hero-mark__stroke-sh" d="M 510 560 L 690 55 L 880 430 L 600 375" />
            <path
              className="hero-mark__stroke-body hero-mark__stroke-body--a"
              d="M 510 560 L 690 55 L 880 430 L 600 375"
            />
          </g>
          {/* the "i" tittle */}
          <circle className="hero-mark__dot" cx="520" cy="55" r="34" />
        </svg>
      </span>

      {/* The real wordmark — accessible text, dimensional gold, written
          left→right by a mask edge that rides the light. */}
      <span className="hero-mark__wordmark">{WORDMARK}</span>
      {/* The glowing baseline the name is written onto, then a settled rule. */}
      <span aria-hidden="true" className="hero-mark__base" />

      {debug ? (
        <output className="pointer-events-none fixed left-2 top-2 z-[200] rounded bg-black/80 px-2 py-1 font-mono text-[10px] leading-tight text-white">
          top {debug.top} · range {debug.range} · reveal {debug.reveal.toFixed(3)}
        </output>
      ) : null}
    </h1>
  );
}
