import type { CSSProperties } from "react";
import { HeroMark } from "@/components/sections/HeroMark";
import { business, hero, materials } from "@/content/site";
import { themes } from "@/lib/themeEngine";

// The Hero's curated multi-colour palette — gold-anchored, every tone a
// low-saturation "material light" drawn from the site's own vocabulary:
//   cool  = Verdigris teal        (ACP / acrylic)
//   cyan  = the LED material blue  (LED signage)
//   rose  = Signal coral          (print / rose)
//   warm  = Ember copper          (wedding warmth)
//   violet= the one addition the reference calls for (Star Flex mood) —
//           a muted mauve, kept deliberately low-saturation.
// Read here into local custom properties; :root is never written.
const HERO_COOL = themes.verdigris.accent;
const HERO_CYAN = materials.find((m) => m.name === "LED")?.accent ?? "#7fe3ff";
const HERO_ROSE = themes.signal.accent;
const HERO_WARM = themes.ember.accent;
const HERO_VIOLET = "#8f5aa6";

/**
 * The Hero identity reveal (∞ 11): the "iA" logo mark unfolds into the
 * wordmark "THE INFINITY ART" as the visitor scrolls. The mark's strokes
 * are the visible cause of the name — see HeroMark.tsx. SVG/CSS, no 3D
 * stack, no animation library.
 *
 * The Hero is pinned (∞ 10.1): `.hero-scroll` is 220dvh, `.hero-scroll__pin`
 * is `position: sticky`, so the hero content holds on screen while the
 * extra scroll distance scrubs the reveal 0→1; then the pin releases and
 * the page continues. Layout only — no wheel interception; native scroll
 * (flick, scrollbar, PageDown) is untouched. Reduced motion collapses the
 * section to one viewport and drops the pin (see globals.css).
 *
 * `--hero-warm` / `--hero-cool` are read from the site's own theme
 * palette (`lib/themeEngine` `themes`) — the ambient wash draws a whisper
 * of ember and verdigris through the nocturne gold as the name is written,
 * then settles gold-dominant. This reads the theme; it never writes :root.
 *
 * Copy is unchanged: the brand label, the tagline, both CTAs, the layout
 * hierarchy. The accessible brand name is now the real text inside the
 * `<h1>` (revealed by the mask), plus the mono label above the copy.
 */
export function Hero() {
  return (
    <section className="hero-scroll relative bg-ground">
      <div
        className="hero-scroll__pin flex h-dvh flex-col justify-end overflow-hidden"
        style={
          {
            "--hero-cool": HERO_COOL,
            "--hero-cyan": HERO_CYAN,
            "--hero-rose": HERO_ROSE,
            "--hero-warm": HERO_WARM,
            "--hero-violet": HERO_VIOLET,
          } as CSSProperties
        }
      >
        {/* Ambient wash — nocturne gold, with a low warm/cool bias that
            enters as the name is written. Backmost layer. */}
        <div aria-hidden="true" className="hero-mark__ambient pointer-events-none absolute inset-0" />

        {/* The identity reveal — logo → wordmark */}
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center overflow-hidden">
          <HeroMark />
        </div>

        {/* Scrim only behind the copy block — a full-height scrim would wash
            out the reveal above, which lives in exactly the zone a
            bottom-up gradient darkens. */}
        <div
          className="absolute inset-x-0 bottom-0 z-30 h-[45%] bg-gradient-to-t from-ground via-ground/70 to-transparent"
          aria-hidden="true"
        />

        <div className="relative z-40 flex flex-col gap-6 px-6 pb-16 pt-32 md:px-12 md:pb-24">
          <p className="hero-eyebrow font-mono text-step--1 uppercase tracking-label text-accent">
            {business.legalName}
          </p>
          <p className="measure text-step-1 text-text-muted">{hero.headline}</p>
          <div className="flex flex-wrap gap-4 pt-2">
            <a
              href={hero.primaryCta.href}
              className="rounded bg-accent px-5 py-3 font-mono text-step--1 uppercase tracking-label text-ground"
            >
              {hero.primaryCta.label}
            </a>
            <a
              href={hero.secondaryCta.href}
              className="rounded border border-border px-5 py-3 font-mono text-step--1 uppercase tracking-label text-text"
            >
              {hero.secondaryCta.label}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
