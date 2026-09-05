"use client";

import dynamic from "next/dynamic";
import { useRef } from "react";
import { Placeholder } from "@/components/ui/Placeholder";
import { Reveal } from "@/components/ui/Reveal";
import { useHeroStore } from "@/lib/store";
import { wedding } from "@/content/site";

const WeddingCanvas = dynamic(() => import("@/components/wedding/WeddingCanvas").then((m) => m.WeddingCanvas), {
  ssr: false,
  loading: () => null,
});

/**
 * Tier A/B get the live scroll-driven fold (M7, kept as-is per SPEC.md
 * rule 2 — the spec doesn't dictate fold mechanics); tier C — and anyone
 * whose tier hasn't been detected yet, including every server-rendered
 * pass — gets the same static placeholder used everywhere else, never a
 * blank gap.
 */
export function Wedding() {
  const sectionRef = useRef<HTMLElement>(null);
  const tier = useHeroStore((s) => s.tier);
  const showFold = tier === "A" || tier === "B";

  return (
    <section ref={sectionRef} id="wedding" className="px-6 py-section md:px-12">
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 lg:grid-cols-2">
        <Reveal>
          {showFold ? (
            <WeddingCanvas sectionRef={sectionRef} />
          ) : (
            <Placeholder
              filename={wedding.image.filename}
              aspect={wedding.image.aspect}
              className="rounded"
            />
          )}
        </Reveal>
        <Reveal index={1} className="flex flex-col gap-4">
          <p className="font-mono text-step--1 uppercase tracking-label text-accent">
            {wedding.eyebrow}
          </p>
          <h2 className="text-step-3">{wedding.headline}</h2>
          <p className="measure text-step-0 text-text-muted">{wedding.body}</p>
          <a
            href={wedding.cta.href}
            className="w-fit rounded bg-accent px-5 py-3 font-mono text-step--1 uppercase tracking-label text-ground"
          >
            {wedding.cta.label}
          </a>
        </Reveal>
      </div>
    </section>
  );
}
