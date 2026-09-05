"use client";

import { useRef, useState } from "react";
import { Marker } from "@/components/theme/Marker";
import { Reveal } from "@/components/ui/Reveal";
import { usePrefersReducedMotion } from "@/lib/tier";
import { business, eyeLenses, materials, shahidsEye } from "@/content/site";
import type { EyeLensId } from "@/content/types";

/**
 * "Shahid's Eye" — one subject (a mock signage plaque of the studio's own
 * name), six lenses that each transform it. Not six unrelated demo cards:
 * the point is that the SAME object reads differently depending on what
 * you're looking for, which is the whole idea this section exists to
 * communicate. See DECISIONS.md.
 */
export function ShahidsEye() {
  const [lens, setLens] = useState<EyeLensId | null>(null);
  const [materialIndex, setMaterialIndex] = useState(0);
  const stageRef = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();

  const activeMaterial = materials[materialIndex];

  function selectLens(id: EyeLensId) {
    const next = lens === id ? null : id;
    setLens(next);
    if (next !== "material") {
      stageRef.current?.style.removeProperty("--color-accent");
    } else {
      stageRef.current?.style.setProperty("--color-accent", activeMaterial.accent);
    }
  }

  function selectMaterial(index: number) {
    setMaterialIndex(index);
    stageRef.current?.style.setProperty("--color-accent", materials[index].accent);
  }

  const annotation = lens ? eyeLenses.find((l) => l.id === lens)!.annotation : null;
  const transition = reduced ? "" : "transition-all duration-500 ease-out";

  return (
    <section className="px-6 py-section md:px-12">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <Reveal>
          <div className="flex flex-col gap-3">
            <p className="font-mono text-step--1 uppercase tracking-label text-accent">
              {shahidsEye.eyebrow}
            </p>
            <h2 className="text-heading">{shahidsEye.headline}</h2>
            <p className="measure text-step-1 text-text-muted">{shahidsEye.subhead}</p>
          </div>
        </Reveal>

        <Reveal index={1}>
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_1.2fr] lg:items-center">
            {/* Lens choices — a wrapping grid of real buttons, not chips
                that need horizontal scrolling on a phone. Ordered after
                the stage on mobile (see the subject before choosing how
                to look at it), before it on desktop's side-by-side layout. */}
            <div
              role="group"
              aria-label="Choose a lens"
              className="order-2 grid grid-cols-3 gap-2 lg:order-1 lg:grid-cols-2"
            >
              {eyeLenses.map((l) => (
                <button
                  key={l.id}
                  type="button"
                  aria-pressed={lens === l.id}
                  onClick={() => selectLens(l.id)}
                  className={`rounded border px-4 py-3 font-mono text-step--1 uppercase tracking-label transition-colors duration-200 ${
                    lens === l.id
                      ? "border-accent bg-accent text-ground"
                      : "border-border text-text-muted hover:border-text-muted hover:text-text"
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>

            {/* The stage — one subject, transformed by whichever lens is active. */}
            <div className="order-1 flex flex-col gap-4 lg:order-2">
              <div
                ref={stageRef}
                className={`relative flex aspect-[4/3] items-center overflow-hidden rounded border border-border bg-surface p-8 ${
                  lens === "balance" ? "justify-start" : "justify-center"
                } ${transition}`}
              >
                <div
                  className={`flex flex-col ${
                    lens === "balance" ? "items-start text-left" : "items-center text-center"
                  } ${transition}`}
                >
                  <p
                    className={`text-step-2 font-display font-extrabold uppercase text-text ${transition}`}
                    style={{
                      letterSpacing: lens === "type" ? "0.35em" : "-0.01em",
                      ...(lens === "light"
                        ? { textShadow: "0 0 24px var(--color-accent)", color: "var(--color-accent)" }
                        : null),
                      ...(lens === "colour" ? { color: "var(--color-accent)" } : null),
                    }}
                  >
                    {business.legalName}
                  </p>
                  <p
                    className={`font-mono text-step--1 uppercase tracking-label ${transition}`}
                    style={{
                      marginTop: lens === "space" ? "2.5rem" : "0.5rem",
                      opacity: lens === "light" ? 0.25 : 0.7,
                    }}
                  >
                    {business.tagline}
                  </p>
                </div>

                {lens === "material" ? (
                  <div
                    aria-hidden="true"
                    className={`absolute inset-0 ${transition}`}
                    style={{
                      opacity: 0.12,
                      backgroundImage:
                        "repeating-linear-gradient(45deg, var(--color-accent) 0, var(--color-accent) 2px, transparent 2px, transparent 8px)",
                    }}
                  />
                ) : null}

                {lens === "type" ? <Marker xPercent={50} yPercent={38} label="Spacing" animate={!reduced} /> : null}
                {lens === "space" ? <Marker xPercent={50} yPercent={62} label="Room" animate={!reduced} /> : null}
                {lens === "light" ? <Marker xPercent={78} yPercent={30} label="Glow" animate={!reduced} /> : null}
                {lens === "colour" ? <Marker xPercent={22} yPercent={30} label="Focus" animate={!reduced} /> : null}
                {lens === "balance" ? (
                  <Marker xPercent={85} yPercent={50} label="Counterweight" animate={!reduced} />
                ) : null}
              </div>

              {lens === "material" ? (
                <div role="group" aria-label="Choose a material" className="flex flex-wrap gap-2">
                  {materials.map((m, i) => (
                    <button
                      key={m.name}
                      type="button"
                      aria-pressed={i === materialIndex}
                      onClick={() => selectMaterial(i)}
                      className={`rounded-full border px-3 py-1 font-mono text-[0.65rem] uppercase tracking-label transition-colors duration-200 ${
                        i === materialIndex
                          ? "border-accent text-accent"
                          : "border-border text-text-muted hover:border-text-muted"
                      }`}
                    >
                      {m.name}
                    </button>
                  ))}
                </div>
              ) : null}

              <p className="min-h-6 text-step--1 text-text-muted" aria-live="polite">
                {annotation ?? "Choose a lens to see what changes."}
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
