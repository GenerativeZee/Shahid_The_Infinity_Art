"use client";

import { useRef, useState } from "react";
import { Marker } from "@/components/theme/Marker";
import { ProcessArtifact } from "@/components/sections/ProcessArtifact";
import { ProgressTrack } from "@/components/theme/ProgressTrack";
import { Reveal } from "@/components/ui/Reveal";
import { usePrefersReducedMotion } from "@/lib/tier";
import { eyeLenses, process } from "@/content/site";

/**
 * One sign panel, four states — Design → Approval → Print → Installation.
 * The stepper stays (click a number, arrow-key, or swipe on touch), but
 * the centrepiece is now a single artefact that physically transforms in
 * place rather than four separate icons (∞ iteration 7 — see
 * DECISIONS.md). All of the transformation lives in `ProcessArtifact`;
 * this component only owns which state is active.
 *
 * A decorative `Marker` on the artefact carries the Shahid's Eye lens
 * each stage foregrounds (Type positioned → Material carries it → Space
 * changes how it reads), so the design decisions from that section are
 * seen surviving into the finished, mounted board.
 *
 * Reaching Installation still reveals the quiet logo-mark callback to the
 * Digital section that immediately follows it in the page — the board
 * goes up, the work continues.
 */

// Where the lens marker points, per state (percent of the artefact box).
// Approval (index 1) has no lens — it is a decision, not an observation.
const LENS_MARKER: Record<number, { x: number; y: number }> = {
  0: { x: 50, y: 44 },
  2: { x: 33, y: 38 },
  3: { x: 57, y: 18 },
};

export function Process() {
  const [activeIndex, setActiveIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);

  function go(delta: number) {
    setActiveIndex((i) => Math.min(process.length - 1, Math.max(0, i + delta)));
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowRight") go(1);
    if (e.key === "ArrowLeft") go(-1);
  }

  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }

  function onTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) > 40) go(delta < 0 ? 1 : -1);
    touchStartX.current = null;
  }

  const activeStep = process[activeIndex];
  const reduced = usePrefersReducedMotion();
  const enterStyle = reduced ? undefined : { animation: "process-step-in 400ms ease both" };

  const lensId = activeStep.lens;
  const lensLabel = lensId ? eyeLenses.find((l) => l.id === lensId)?.label : undefined;
  const markerPos = LENS_MARKER[activeIndex];

  return (
    <section id="process" className="bg-surface px-6 py-section md:px-12">
      <div className="mx-auto flex max-w-6xl flex-col gap-10">
        <Reveal>
          <div className="flex flex-col gap-3">
            <p className="font-mono text-step--1 uppercase tracking-label text-accent">Process</p>
            <h2 className="text-heading">How a job runs</h2>
            <p className="measure text-step-0 text-text-muted">
              Four steps, every time. Step through them to watch one board take shape — the same
              piece, from a drawing to a sign on a wall.
            </p>
          </div>
        </Reveal>

        <Reveal index={1}>
          <div
            className="flex flex-col gap-8 md:flex-row md:items-center md:gap-12"
            onKeyDown={onKeyDown}
          >
            <div
              className="relative flex aspect-[4/3] w-full max-w-md shrink-0 touch-pan-y items-center justify-center self-center overflow-hidden rounded border border-border bg-ground"
              onTouchStart={onTouchStart}
              onTouchEnd={onTouchEnd}
            >
              <ProcessArtifact
                state={activeIndex}
                label={`Stage ${activeStep.step} of ${process.length} — ${activeStep.name}. ${activeStep.visual}`}
              />
              {lensLabel && markerPos ? (
                <Marker
                  key={activeIndex}
                  xPercent={markerPos.x}
                  yPercent={markerPos.y}
                  label={lensLabel}
                  animate={!reduced}
                />
              ) : null}
            </div>

            <div className="flex flex-1 flex-col gap-6">
              {/*
               * A plain button group, not an ARIA tabs widget — role="tab"
               * implies arrow keys move focus between tabs, which this
               * doesn't do (arrow keys change the active step without
               * moving focus). aria-current="step" describes the state
               * honestly without promising a keyboard contract this
               * component doesn't fully implement.
               */}
              <ProgressTrack
                count={process.length}
                activeIndex={activeIndex}
                onSelect={setActiveIndex}
                ariaLabel="Process steps"
                dotContent={(i) => String(process[i].step).padStart(2, "0")}
                dotAriaLabel={(i) => `${process[i].step} — ${process[i].name}`}
              />

              <div key={activeStep.step} className="flex flex-col gap-2" style={enterStyle}>
                <h3 className="text-step-1 font-semibold text-text">{activeStep.name}</h3>
                <p className="measure text-step-0 text-text-muted">{activeStep.description}</p>
              </div>

              {activeIndex === process.length - 1 ? (
                <div
                  style={reduced ? undefined : { animation: "process-step-in 500ms ease both" }}
                  className="flex items-center gap-2 text-text-muted"
                >
                  <span
                    aria-hidden="true"
                    className="h-4 w-4 shrink-0 bg-accent"
                    style={{
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
                  <p className="text-step--1">The board goes up. The site comes next.</p>
                </div>
              ) : null}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
