import { DayNightReveal } from "@/components/hero/DayNightReveal";
import { business, hero } from "@/content/site";

/**
 * SPEC.md §5.1 + §5.2. The old 300dvh scroll-jacked live-3D hero (M3-M5) is
 * retired from this section — that mechanism now belongs to the separate
 * board-fabrication scroll sequence (§8), a section not yet built (R4).
 * The R3F code itself isn't deleted; it's the candidate for §8.3's optional
 * live-3D layer, judged at R5. See DECISIONS.md.
 *
 * The wordmark is the logo's icon mark alone (public/logo/mark.png,
 * cropped from Shahid's real logo — see DECISIONS.md), not the full
 * business name as text: three words can't satisfy `white-space: nowrap`
 * at this scale on any real viewport (confirmed live: the full name
 * clipped mid-word off-screen), and the full logo file's stacked text
 * lines don't fit a single nowrap line either. Rendered as a flat
 * accent-coloured CSS mask, not the logo's own raster gradient, so
 * changing --color-accent (SPEC.md §16) recolours it too. The headline
 * becomes the "one line of copy" §7 calls for underneath it; the business
 * name itself still renders as real text via the h1's aria-label and the
 * small label above the copy.
 */
export function Hero() {
  return (
    <section className="relative flex h-dvh flex-col justify-end overflow-hidden bg-ground">
      {/* Wordmark — behind the photo panel (z-index:1 vs the panel's :2) */}
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

      {/* The hero photo panel overlaps the wordmark, not full-bleed — that's
          what makes the type read as architecture the subject stands in
          front of, rather than a caption under a full-screen photo. */}
      <div className="absolute left-1/2 top-[42%] z-20 h-[52vh] w-[min(78vw,760px)] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded shadow-2xl shadow-black/60">
        <DayNightReveal />
      </div>

      {/* Scrim only behind the copy block below, not the full hero — a
          full-height scrim would wash out the photo panel above, which
          sits centered in exactly the zone a bottom-up gradient darkens. */}
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
