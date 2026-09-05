"use client";

import { useState } from "react";
import { BuildItArtifact } from "@/components/sections/BuildItArtifact";
import { Marker } from "@/components/theme/Marker";
import { Reveal } from "@/components/ui/Reveal";
import { usePrefersReducedMotion } from "@/lib/tier";
import { buildIt, eyeLenses, materials } from "@/content/site";
import type {
  BuildLetteringId,
  BuildLightId,
  BuildMaterialId,
  BuildProportionId,
  EyeLensId,
} from "@/content/types";

/**
 * "Build It" — the final interactive idea. Four decisions reshape one
 * persistent sign artefact (`BuildItArtifact`), so a visitor feels the
 * difference a choice makes. Everything is local state; the only global
 * touch is a scoped `--color-accent` override on this section's own
 * wrapper (never :root), the same pattern MaterialExplorer and Shahid's
 * Eye already use — the scroll ThemeEngine is never involved.
 *
 * The four controls quietly are four of Shahid's Eye's lenses — the
 * `Marker` on the preview names whichever one the visitor last touched.
 * No second six-lens explainer; the continuity is in the doing.
 */

type Control = "material" | "proportion" | "lettering" | "light";

const CONTROL_LENS: Record<Control, EyeLensId> = {
  material: "material",
  proportion: "space",
  lettering: "type",
  light: "light",
};

const MARKER_POS: Record<Control, { x: number; y: number }> = {
  material: { x: 30, y: 64 },
  proportion: { x: 72, y: 22 },
  lettering: { x: 50, y: 44 },
  light: { x: 24, y: 26 },
};

const MATERIAL_ACCENT: Record<BuildMaterialId, string> = Object.fromEntries(
  buildIt.materials.map((m) => [
    m.id,
    materials.find((mat) => mat.name === m.sample)?.accent ?? "#c9a35a",
  ]),
) as Record<BuildMaterialId, string>;

export function BuildIt() {
  const [material, setMaterial] = useState<BuildMaterialId>("acp");
  const [proportion, setProportion] = useState<BuildProportionId>("standard");
  const [lettering, setLettering] = useState<BuildLetteringId>("clean");
  const [light, setLight] = useState<BuildLightId>("none");
  const [lastChanged, setLastChanged] = useState<Control | null>(null);
  const reduced = usePrefersReducedMotion();

  const currentMaterial = buildIt.materials.find((m) => m.id === material)!;
  const propLabel = buildIt.proportions.find((p) => p.id === proportion)!.label;
  const letterLabel = buildIt.lettering.find((l) => l.id === lettering)!.label;
  const lightLabel = buildIt.light.find((l) => l.id === light)!.label;

  const changeCount = [
    material !== "acp",
    proportion !== "standard",
    lettering !== "clean",
    light !== "none",
  ].filter(Boolean).length;
  const showPayoff = changeCount >= 2;

  const lightSummary = light === "none" ? "No light" : `${lightLabel} light`;
  const summary = `${currentMaterial.label} · ${propLabel} · ${letterLabel} · ${lightSummary}`;
  const artifactLabel = `A ${propLabel.toLowerCase()} ${currentMaterial.label} sign panel, ${letterLabel.toLowerCase()} lettering, ${
    light === "none" ? "unlit" : `${lightLabel.toLowerCase()} glow`
  }.`;

  const lensId = lastChanged ? CONTROL_LENS[lastChanged] : null;
  const lensLabel = lensId ? eyeLenses.find((l) => l.id === lensId)?.label : undefined;
  const markerPos = lastChanged ? MARKER_POS[lastChanged] : undefined;

  return (
    <section id="build" className="px-6 py-section md:px-12">
      <div
        className="mx-auto flex max-w-2xl flex-col gap-10"
        style={{ ["--color-accent" as string]: MATERIAL_ACCENT[material] } as React.CSSProperties}
      >
        <Reveal>
          <div className="flex flex-col gap-3">
            <p className="font-mono text-step--1 uppercase tracking-label text-accent">
              {buildIt.eyebrow}
            </p>
            <h2 className="text-heading">{buildIt.headline}</h2>
            <p className="measure text-step-0 text-text-muted">{buildIt.body}</p>
          </div>
        </Reveal>

        <Reveal index={1} className="flex flex-col gap-6">
          <div className="relative mx-auto flex aspect-[4/3] w-full max-w-xl items-center justify-center overflow-hidden rounded border border-border bg-ground">
            <BuildItArtifact
              material={material}
              proportion={proportion}
              lettering={lettering}
              light={light}
              label={artifactLabel}
            />
            {lensLabel && markerPos ? (
              <Marker
                key={lastChanged}
                xPercent={markerPos.x}
                yPercent={markerPos.y}
                label={lensLabel}
                animate={!reduced}
              />
            ) : null}
          </div>

          <p className="min-h-6 text-center text-step--1 text-text-muted" aria-live="polite">
            <span className="font-mono uppercase tracking-label text-accent">
              {currentMaterial.label}
            </span>
            {" — "}
            {currentMaterial.character}
          </p>

          <div aria-live="polite">
            {showPayoff ? (
              <div
                style={reduced ? undefined : { animation: "material-preview-in 320ms ease-out" }}
                className="mx-auto flex max-w-md flex-col items-center gap-1 border-t border-border pt-5 text-center"
              >
                <p className="text-step-0 text-text">{buildIt.payoffHeading}</p>
                <p className="font-mono text-step--1 uppercase tracking-label text-text-muted">
                  <span className="text-accent">{buildIt.payoffLabel}</span> — {summary}
                </p>
              </div>
            ) : null}
          </div>
        </Reveal>

        <Reveal index={2} className="flex flex-col gap-4">
          <ControlRow
            label="Material"
            options={buildIt.materials}
            value={material}
            onSelect={(v) => {
              setMaterial(v);
              setLastChanged("material");
            }}
          />
          <ControlRow
            label="Proportion"
            options={buildIt.proportions}
            value={proportion}
            onSelect={(v) => {
              setProportion(v);
              setLastChanged("proportion");
            }}
          />
          <ControlRow
            label="Lettering"
            options={buildIt.lettering}
            value={lettering}
            onSelect={(v) => {
              setLettering(v);
              setLastChanged("lettering");
            }}
          />
          <ControlRow
            label="Light"
            options={buildIt.light}
            value={light}
            onSelect={(v) => {
              setLight(v);
              setLastChanged("light");
            }}
          />
        </Reveal>

        <Reveal index={3}>
          <div className="flex flex-col items-start gap-3 border-t border-border pt-8">
            <p className="text-step-1 text-text">{buildIt.ctaLead}</p>
            <p className="measure text-step-0 text-text-muted">{buildIt.ctaLine}</p>
            <a
              href={buildIt.ctaHref}
              className="mt-1 w-fit rounded bg-accent px-6 py-3 font-mono text-step--1 uppercase tracking-label text-ground"
            >
              {buildIt.ctaLabel} →
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function ControlRow<T extends string>({
  label,
  options,
  value,
  onSelect,
}: {
  label: string;
  options: readonly { id: T; label: string }[];
  value: T;
  onSelect: (value: T) => void;
}) {
  return (
    <div
      role="group"
      aria-label={label}
      className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:gap-4"
    >
      <span className="font-mono text-step--1 uppercase tracking-label text-text-muted sm:w-24 sm:shrink-0">
        {label}
      </span>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => {
          const active = o.id === value;
          return (
            <button
              key={o.id}
              type="button"
              aria-pressed={active}
              onClick={() => onSelect(o.id)}
              className={`rounded border px-4 py-3.5 font-mono text-step--1 uppercase tracking-label transition-colors duration-200 ${
                active
                  ? "border-accent bg-accent text-ground"
                  : "border-border text-text-muted hover:border-text-muted hover:text-text"
              }`}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
