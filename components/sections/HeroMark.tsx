"use client";

import { useEffect, useRef, useState } from "react";
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

export function HeroMark() {
  const ref = useRef<HTMLHeadingElement>(null);
  const [debug, setDebug] = useState<{ top: number; range: number; reveal: number } | null>(null);

  useEffect(() => {
    const h1 = ref.current;
    if (!h1) return;

    const pin = (h1.closest(".hero-scroll__pin") as HTMLElement | null) ?? h1;
    const section = (h1.closest(".hero-scroll") as HTMLElement | null) ?? pin;

    if (prefersReducedMotion()) {
      pin.style.setProperty("--reveal", "1");
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
      pin.style.setProperty("--reveal", p.toFixed(4));
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
          <defs>
            <linearGradient id="hero-mark-gold" x1="0" y1="1" x2="1" y2="0">
              <stop offset="0" stopColor="color-mix(in srgb, var(--color-accent) 55%, #000000)" />
              <stop offset="0.5" stopColor="var(--color-accent)" />
              <stop offset="1" stopColor="color-mix(in srgb, var(--color-accent) 72%, #ffffff)" />
            </linearGradient>
          </defs>

          <g
            stroke="url(#hero-mark-gold)"
            strokeWidth="72"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {/* the checkmark / left "i" stroke */}
            <path className="hero-mark__stroke hero-mark__stroke--v" d="M 110 210 L 290 540 L 460 175" />
            {/* the "A" — apex, legs, hooked return */}
            <path
              className="hero-mark__stroke hero-mark__stroke--a"
              d="M 510 560 L 690 55 L 880 430 L 600 375"
            />
          </g>
          {/* the "i" tittle */}
          <circle className="hero-mark__dot" cx="520" cy="55" r="34" fill="var(--color-accent)" />
        </svg>
      </span>

      {/* The real wordmark — accessible text, revealed by a left→right mask */}
      <span className="hero-mark__wordmark">{WORDMARK}</span>
      <span aria-hidden="true" className="hero-mark__rule" />

      {debug ? (
        <output className="pointer-events-none fixed left-2 top-2 z-[200] rounded bg-black/80 px-2 py-1 font-mono text-[10px] leading-tight text-white">
          top {debug.top} · range {debug.range} · reveal {debug.reveal.toFixed(3)}
        </output>
      ) : null}
    </h1>
  );
}
