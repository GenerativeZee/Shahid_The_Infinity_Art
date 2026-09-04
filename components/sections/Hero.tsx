"use client";

import { useRef } from "react";
import { HeroStage } from "@/components/hero/HeroStage";
import { useHeroProgress } from "@/components/hero/useHeroProgress";
import { hero } from "@/content/site";

/**
 * The 300dvh scroll track (§6: "not more"). The inner stage is pinned via
 * `sticky` for the full track height, so the DOM copy below scrolls the
 * visitor straight into the Work section the instant the track ends —
 * standard scrollytelling pinning, native scroll drives it the whole way.
 */
export function Hero() {
  const trackRef = useRef<HTMLDivElement>(null);
  useHeroProgress(trackRef);

  return (
    <div ref={trackRef} className="relative h-[300dvh]">
      <div className="sticky top-0 flex h-dvh flex-col justify-end overflow-hidden">
        <HeroStage />
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
      </div>
    </div>
  );
}
