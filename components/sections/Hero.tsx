import { Placeholder } from "@/components/ui/Placeholder";
import { hero } from "@/content/site";

/**
 * Static placeholder for M1b. The scroll-driven 3D sequence (frame 1 of
 * which doubles as this poster, per §8) replaces the background layer at
 * M3–M5 — the DOM copy and CTAs stay exactly as they are now.
 */
export function Hero() {
  return (
    <section className="relative flex min-h-dvh flex-col justify-end overflow-hidden">
      <div className="absolute inset-0" aria-hidden="true">
        <Placeholder filename="hero-seq/hero_0001.webp" aspect="4/3" className="h-full w-full" />
      </div>
      <div
        className="absolute inset-0 bg-gradient-to-t from-ground via-ground/80 to-ground/30"
        aria-hidden="true"
      />
      <div className="relative z-10 flex flex-col gap-6 px-6 pb-16 pt-32 md:px-12 md:pb-24">
        <p className="font-mono text-step--1 uppercase tracking-label text-accent">
          {hero.eyebrow}
        </p>
        <h1 className="text-step-5 text-text">{hero.headline}</h1>
        <p className="measure text-step-1 text-text-muted">{hero.subhead}</p>
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
