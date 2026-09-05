import { HeroArtifact } from "@/components/sections/HeroArtifact";
import { business, hero } from "@/content/site";

/**
 * The day/night mask reveal (SPEC.md §5.1) is retired. In its place, one
 * scroll-revealed signature artifact (`HeroArtifact`): the studio's own
 * dimensional "INFINITY ART" shopfront sign, seen close and cropped in a
 * dark gallery — material → structure → identity → light → mounted. Same
 * object family Process builds and Build It configures, so the Hero is the
 * thesis the rest of the site proves. SVG/CSS, no 3D stack. See DECISIONS.md.
 *
 * Everything semantic is unchanged: the logo-mark wordmark, the eyebrow,
 * the one line of copy, the two CTAs, the layout hierarchy. The wordmark
 * is the logo's icon mark alone (public/logo/mark.png), rendered as a flat
 * accent-coloured CSS mask so --color-accent recolours it (SPEC.md §16);
 * the business name renders as real text via the h1's aria-label and the
 * mono label above the copy.
 */
export function Hero() {
  return (
    <section className="relative flex h-dvh flex-col justify-end overflow-hidden bg-ground">
      {/* Backmost visual layer — the fabricated sign specimen, revealed on scroll */}
      <HeroArtifact />

      {/* Wordmark — sits above the artifact, below the copy scrim */}
      <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center overflow-hidden">
        <h1 aria-label={business.legalName} className="flex">
          <span
            aria-hidden="true"
            className="bg-accent"
            style={{
              height: "var(--text-hero)",
              aspectRatio: "1000 / 642",
              WebkitMaskImage: "url(/logo/mark.png)",
              maskImage: "url(/logo/mark.png)",
              WebkitMaskSize: "contain",
              maskSize: "contain",
              WebkitMaskRepeat: "no-repeat",
              maskRepeat: "no-repeat",
              WebkitMaskPosition: "center",
              maskPosition: "center",
            }}
          />
        </h1>
      </div>

      {/* Scrim only behind the copy block — a full-height scrim would wash
          out the artifact above, which lives in exactly the zone a
          bottom-up gradient darkens. */}
      <div
        className="absolute inset-x-0 bottom-0 z-30 h-[45%] bg-gradient-to-t from-ground via-ground/70 to-transparent"
        aria-hidden="true"
      />

      <div className="relative z-40 flex flex-col gap-6 px-6 pb-16 pt-32 md:px-12 md:pb-24">
        <p className="font-mono text-step--1 uppercase tracking-label text-accent">
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
    </section>
  );
}
