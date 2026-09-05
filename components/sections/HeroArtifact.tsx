"use client";

import { useEffect, useRef, useState } from "react";
import { getLenis } from "@/lib/scroll";
import { prefersReducedMotion } from "@/lib/tier";

/**
 * The Hero's signature artifact (∞ iteration 10). One large dimensional
 * shopfront sign — the studio's own "INFINITY ART" nameboard — seen close
 * and cropped in a dark gallery. The visitor scrolls *along and into* it:
 * a restrained camera dolly plus a progressive reveal, all bound to one
 * normalized progress.
 *
 *   ~0.00–0.15  presence   only a cut edge + a sliver of face, deep shadow
 *   ~0.15–0.36  material   the ACP face and its hatch texture resolve; the
 *                          board shows real thickness
 *   ~0.36–0.55  structure  construction lines register, then clear;
 *                          mounting bolts resolve — it was fabricated
 *   ~0.55–0.78  identity   the lettering extrudes from the face and its
 *                          front inks solid — it is a sign now
 *   ~0.78–0.92  light      one raking highlight on the letters, a low warm
 *                          glow seated behind them, the cast shadow deepens
 *   ~0.92–1.00  arrival    the wall resolves; sign mounted, lit, cropped
 *
 * It is the same object family Process builds four states of and Build It
 * lets you configure, so the Hero is the thesis the rest of the site
 * proves. It contains — never labels — Shahid's Eye's six lenses (Type in
 * the lettering, Light in the rake, Space in the crop, Material in the
 * ACP, Colour in the single accent, Balance in the asymmetric composition).
 *
 * Scroll model (kept from ∞ 9.1): one CSS variable `--reveal` (0→1),
 * computed *synchronously* inside Lenis's own scroll tick — by then Lenis
 * has applied its transform for the frame, so getBoundingClientRect is the
 * position on screen right now. No requestAnimationFrame hop (that left
 * the artifact a frame behind and made it "catch up" after a flick), no
 * React state in the scroll path, and deliberately NO CSS transition on
 * any scroll-bound property — Lenis's easing is the only smoothing. Every
 * artifact value in globals.css is a plain calc() of --reveal, so stopping
 * anywhere is a composed frame.
 *
 * The Hero is pinned (∞ 10.1): progress is measured against the tall
 * `.hero-scroll` section (not this element, which is inside the sticky
 * wrapper and stays at the top of the viewport while pinned).
 * `--reveal` reaches 1 at ~90% of the pin's scroll distance, so the
 * finished sign is held on screen for a beat before the pin releases.
 *
 * Purely decorative → aria-hidden. Reduced motion pins --reveal to 1: the
 * arrival composition, static.
 */

const HATCH_ID = "hero-artifact-hatch";
const WORDMARK = "INFINITY ART";

// Panel lives lower-right of the frame and extends past its edges — the
// sign is only ever partly in view (intentional crop). World units.
const PANEL = { x: 520, y: 380, w: 1000, h: 380 };
const LETTER_X = PANEL.x + PANEL.w / 2;
const LETTER_Y = PANEL.y + PANEL.h / 2 + 6;

const LETTER_PROPS = {
  x: LETTER_X,
  y: LETTER_Y,
  textAnchor: "middle" as const,
  dominantBaseline: "middle" as const,
  fontFamily: "var(--font-display)",
  fontWeight: 800,
  fontSize: 150,
  letterSpacing: 3,
  textLength: 880,
  lengthAdjust: "spacingAndGlyphs" as const,
};

const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);

export function HeroArtifact() {
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

    // The tall pinned section — progress is its scroll offset, not this
    // element's (which sits in the sticky wrapper and stays put while
    // pinned). Falls back to `wrap` if the markup ever changes.
    const section = (wrap.closest(".hero-scroll") as HTMLElement | null) ?? wrap;

    // Cached here + on resize only — never per scroll frame. Heights are in
    // dvh, so they change as the mobile URL bar shows/hides; reading the
    // range every frame would rescale the 0→1 progress mid-scroll.
    let range = 1;
    function measure() {
      // The pin's scroll distance = section height − one viewport. ×0.9 so
      // --reveal hits 1 slightly before the pin releases (a held beat on
      // the finished sign).
      const dist = (section.getBoundingClientRect().height - window.innerHeight) * 0.9;
      range = dist > 0 ? dist : 1;
    }

    function update() {
      const top = section.getBoundingClientRect().top;
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
    <div
      ref={wrapRef}
      aria-hidden="true"
      className="hero-artifact pointer-events-none absolute inset-0 overflow-hidden"
    >
      <svg
        className="hero-artifact__svg"
        viewBox="0 0 1200 900"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
      >
        <defs>
          <pattern
            id={HATCH_ID}
            width="12"
            height="12"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(45)"
          >
            <line x1="0" y1="0" x2="0" y2="12" stroke="var(--color-accent)" strokeWidth="1.5" />
          </pattern>
        </defs>

        {/* One camera group — the dolly. Everything below sits in a fixed
            world; only this transform (in globals.css) moves. */}
        <g className="hero-artifact__cam">
          {/* Arrival — the gallery wall the finished sign is mounted on.
              Sized to cover the viewBox after the widest camera transform,
              not larger — keeps the promoted layer's texture small. */}
          <rect
            className="hero-artifact__wall"
            x="-400"
            y="-300"
            width="2000"
            height="1600"
            fill="var(--color-surface)"
          />

          {/* Light — cast shadow, sign mounted proud of the wall */}
          <rect
            className="hero-artifact__castshadow"
            x={PANEL.x}
            y={PANEL.y}
            width={PANEL.w}
            height={PANEL.h}
            rx="4"
            fill="#000000"
            transform="translate(24 30)"
            style={{ filter: "blur(11px)" }}
          />

          {/* Material — the board's thickness */}
          <rect
            className="hero-artifact__depth"
            x={PANEL.x}
            y={PANEL.y}
            width={PANEL.w}
            height={PANEL.h}
            rx="4"
            fill="var(--color-ground)"
            stroke="var(--color-border)"
            strokeWidth="1.5"
            transform="translate(9 11)"
          />

          {/* Material — the ACP face, then its printed hatch texture */}
          <rect
            className="hero-artifact__surface"
            x={PANEL.x}
            y={PANEL.y}
            width={PANEL.w}
            height={PANEL.h}
            rx="4"
            fill="var(--color-surface-raised)"
          />
          <rect
            className="hero-artifact__hatch"
            x={PANEL.x}
            y={PANEL.y}
            width={PANEL.w}
            height={PANEL.h}
            rx="4"
            fill={`url(#${HATCH_ID})`}
          />

          {/* Presence / material — the cut edge, on almost from the start */}
          <rect
            className="hero-artifact__edge"
            x={PANEL.x}
            y={PANEL.y}
            width={PANEL.w}
            height={PANEL.h}
            rx="4"
            fill="none"
            stroke="var(--color-border)"
            strokeWidth="2.5"
          />

          {/* Structure — construction lines that register, then clear */}
          <g
            className="hero-artifact__guides"
            stroke="var(--color-accent)"
            strokeWidth="1"
          >
            <line x1={PANEL.x} y1={PANEL.y - 60} x2={PANEL.x} y2={PANEL.y + PANEL.h + 60} strokeDasharray="3 6" />
            <line x1={LETTER_X} y1={PANEL.y - 60} x2={LETTER_X} y2={PANEL.y + PANEL.h + 60} strokeDasharray="3 6" />
            <line x1={PANEL.x - 60} y1={LETTER_Y} x2={PANEL.x + PANEL.w + 60} y2={LETTER_Y} strokeDasharray="3 6" />
            <line x1={PANEL.x} y1={PANEL.y + PANEL.h + 40} x2={PANEL.x + PANEL.w} y2={PANEL.y + PANEL.h + 40} />
            <line x1={PANEL.x} y1={PANEL.y + PANEL.h + 32} x2={PANEL.x} y2={PANEL.y + PANEL.h + 48} />
            <line
              x1={PANEL.x + PANEL.w}
              y1={PANEL.y + PANEL.h + 32}
              x2={PANEL.x + PANEL.w}
              y2={PANEL.y + PANEL.h + 48}
            />
          </g>

          {/* Structure — mounting bolts */}
          <g className="hero-artifact__bolts" fill="var(--color-text-muted)">
            <circle cx={PANEL.x + 46} cy={PANEL.y + 44} r="6" />
            <circle cx={PANEL.x + PANEL.w - 46} cy={PANEL.y + 44} r="6" />
            <circle cx={PANEL.x + 46} cy={PANEL.y + PANEL.h - 44} r="6" />
            <circle cx={PANEL.x + PANEL.w - 46} cy={PANEL.y + PANEL.h - 44} r="6" />
          </g>

          {/* Light — a low warm glow seated behind the lettering */}
          <ellipse
            className="hero-artifact__glow"
            cx={LETTER_X}
            cy={LETTER_Y}
            rx="480"
            ry="170"
            fill="var(--color-accent)"
            style={{ filter: "blur(30px)" }}
          />

          {/* Identity — the lettering. Extrude stack, then a hairline front
              that hands off to a solid front, then a raking highlight. */}
          <g className="hero-artifact__letters">
            <g className="hero-artifact__extrude" fill="var(--color-ground)">
              {[6, 12, 18, 24, 30].map((d) => (
                <text key={d} {...LETTER_PROPS} transform={`translate(${d} ${d * 1.15})`}>
                  {WORDMARK}
                </text>
              ))}
            </g>
            <text
              className="hero-artifact__letterHair"
              {...LETTER_PROPS}
              fill="none"
              stroke="var(--color-text-muted)"
              strokeWidth="1.25"
            >
              {WORDMARK}
            </text>
            <text className="hero-artifact__letterSolid" {...LETTER_PROPS} fill="var(--color-text)">
              {WORDMARK}
            </text>
            <text
              className="hero-artifact__highlight"
              {...LETTER_PROPS}
              fill="var(--color-accent)"
              transform="translate(-2 -3)"
            >
              {WORDMARK}
            </text>
          </g>
        </g>
      </svg>

      {/* Opt-in sync check: add ?herodebug to the URL. */}
      {debug ? (
        <output className="pointer-events-none fixed left-2 top-2 z-[200] rounded bg-black/80 px-2 py-1 font-mono text-[10px] leading-tight text-white">
          top {debug.top} · range {debug.range} · reveal {debug.reveal.toFixed(3)}
        </output>
      ) : null}
    </div>
  );
}
