"use client";

import { useEffect, useRef, useState } from "react";
import { Placeholder } from "@/components/ui/Placeholder";
import { prefersReducedMotion } from "@/lib/tier";
import { whyThisWorksByMaterial } from "@/content/site";
import type { MaterialCategory, ProjectImage } from "@/content/types";

type Layer = { heading: string; text: string; markerLabel?: string; markerPos?: { x: number; y: number } };

/**
 * Portfolio 2.0 "Why This Works" — the site's one signature discovery
 * moment (see DECISIONS.md). Progressive disclosure, one thought at a
 * time, not a staged dump of every fact at once (that was the previous
 * craftDetails version this replaces). Depth is data-driven: categories
 * with a `problem`/`detail` in whyThisWorksByMaterial get the full
 * four-layer arc with an image marker; the rest get the lighter
 * choice+result version automatically, via the same code path.
 */
export function LookAgainReveal({
  image,
  projectName,
  material,
}: {
  image: ProjectImage;
  projectName: string;
  material: MaterialCategory;
}) {
  const [open, setOpen] = useState(false);
  const [stage, setStage] = useState(-1); // -1 = not started
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const why = whyThisWorksByMaterial[material];
  const layers: Layer[] = [
    why.problem ? { heading: "The Problem", text: why.problem } : null,
    { heading: "The Choice", text: why.choice },
    why.detail
      ? {
          heading: "The Detail",
          text: why.detail,
          markerLabel: why.detailMarker?.label,
          markerPos: why.detailMarker
            ? { x: why.detailMarker.xPercent, y: why.detailMarker.yPercent }
            : undefined,
        }
      : null,
    { heading: "The Result", text: why.result },
  ].filter((l): l is Layer => l !== null);

  function openDialog() {
    setOpen(true);
    setStage(-1);
  }

  function closeDialog() {
    setOpen(false);
    triggerRef.current?.focus();
  }

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();

    function focusables(): HTMLElement[] {
      if (!panelRef.current) return [];
      return Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        ),
      );
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        closeDialog();
        return;
      }
      if (e.key !== "Tab") return;

      // Recomputed on every Tab press — the focusable set changes as the
      // visitor steps through layers, so it can't be cached once on open.
      const nodes = focusables();
      if (nodes.length === 0) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      const activeEl = document.activeElement;

      if (e.shiftKey && activeEl === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && activeEl === last) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const activeLayer = stage >= 0 ? layers[stage] : null;
  const enterStyle = prefersReducedMotion() ? undefined : { animation: "look-again-detail 400ms ease both" };

  return (
    <>
      <div className="group relative overflow-hidden">
        <div className="hover-zoom">
          <div className="kenburns-slow">
            <Placeholder filename={image.filename} aspect={image.aspect} />
          </div>
        </div>
        <button
          ref={triggerRef}
          type="button"
          onClick={openDialog}
          className="absolute inset-0 flex items-end justify-start bg-ground/0 p-4 text-left transition-colors duration-300 group-hover:bg-ground/30"
        >
          <span className="rounded border border-accent/60 bg-ground/80 px-3 py-1 font-mono text-[0.65rem] uppercase tracking-label text-accent opacity-70 transition-all duration-300 group-hover:opacity-100">
            Look again
          </span>
        </button>
      </div>

      {open ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`A closer look at ${projectName}`}
          className="fixed inset-0 z-[110] flex items-center justify-center bg-ground/90 p-6"
        >
          <div className="absolute inset-0" onClick={closeDialog} aria-hidden="true" />
          <div
            ref={panelRef}
            className="relative z-10 flex w-full max-w-2xl flex-col gap-6 rounded border border-border bg-surface p-6 md:p-8"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex flex-col gap-1">
                <h3 className="text-step-1 text-text">{projectName}</h3>
                <p className="font-mono text-[0.65rem] uppercase tracking-label text-text-muted">
                  {material.replace("-", " / ")}
                </p>
              </div>
              <button
                ref={closeRef}
                type="button"
                onClick={closeDialog}
                className="shrink-0 rounded border border-border px-3 py-1 font-mono text-step--1 uppercase tracking-label text-text-muted hover:text-text"
              >
                Close
              </button>
            </div>

            {/* Image stays stable throughout — only the marker changes. */}
            <div className="relative">
              <Placeholder filename={image.filename} aspect={image.aspect} className="rounded" />
              {activeLayer?.markerPos ? (
                <div
                  className="pointer-events-none absolute"
                  style={{ left: `${activeLayer.markerPos.x}%`, top: `${activeLayer.markerPos.y}%` }}
                >
                  <span
                    style={enterStyle}
                    className="absolute block h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-accent bg-ground"
                  />
                  <span
                    style={enterStyle}
                    className="absolute left-3 top-0 -translate-y-1/2 whitespace-nowrap rounded border border-accent/60 bg-ground/90 px-2 py-0.5 font-mono text-[0.6rem] uppercase tracking-label text-accent"
                  >
                    {activeLayer.markerLabel}
                  </span>
                </div>
              ) : null}
            </div>

            {stage === -1 ? (
              <button
                type="button"
                onClick={() => setStage(0)}
                className="w-fit rounded bg-accent px-5 py-3 font-mono text-step--1 uppercase tracking-label text-ground"
              >
                Why does this work?
              </button>
            ) : (
              <div className="flex flex-col gap-4" aria-live="polite">
                <div key={stage} style={enterStyle} className="flex flex-col gap-2">
                  <p className="font-mono text-[0.65rem] uppercase tracking-label text-accent">
                    {String(stage + 1).padStart(2, "0")} — {activeLayer!.heading}
                  </p>
                  <p className="measure text-step-0 text-text">{activeLayer!.text}</p>
                </div>

                <div role="group" aria-label="Story steps" className="flex items-center gap-3">
                  <div className="relative flex gap-2">
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-x-2.5 top-1/2 h-px -translate-y-1/2 bg-border"
                    />
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute left-2.5 top-1/2 h-px -translate-y-1/2 bg-accent transition-[width] duration-500"
                      style={{ width: `calc((100% - 1.25rem) * ${stage / (layers.length - 1)})` }}
                    />
                    {layers.map((layer, i) => (
                      <button
                        key={layer.heading}
                        type="button"
                        aria-current={i === stage ? "step" : undefined}
                        aria-label={layer.heading}
                        onClick={() => setStage(i)}
                        className={`relative z-10 h-5 w-5 rounded-full border transition-colors duration-200 ${
                          i === stage
                            ? "border-accent bg-accent"
                            : "border-border bg-surface hover:border-text-muted"
                        }`}
                      />
                    ))}
                  </div>

                  {stage < layers.length - 1 ? (
                    <button
                      type="button"
                      onClick={() => setStage((s) => s + 1)}
                      className="ml-auto rounded border border-border px-3 py-1.5 font-mono text-step--1 uppercase tracking-label text-text-muted hover:text-text"
                    >
                      Next
                    </button>
                  ) : (
                    <p className="ml-auto text-step--1 text-text-muted">Great design lives in the details.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}
