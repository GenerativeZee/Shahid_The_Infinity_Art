"use client";

import { useRef, useState, type SVGProps } from "react";
import { ProgressTrack } from "@/components/theme/ProgressTrack";
import { Reveal } from "@/components/ui/Reveal";
import { usePrefersReducedMotion } from "@/lib/tier";
import { process } from "@/content/site";

/**
 * Evolves the four static cards into a clickable/swipeable stepper (v4
 * interactive pass — see DECISIONS.md). Each stage shows an abstract,
 * theme-tinted illustration (stroke="currentColor", so it re-themes for
 * free) rather than a real project photo — none of these steps have real
 * photography yet, and an abstract "idea -> object" visual is honest
 * where a staged photo pretending to be a real job wouldn't be.
 *
 * Reaching the last step (Installation) reveals a small, quiet callback
 * to the hero's own logo mark — the ∞ iteration's one deliberate "the
 * work is continuous, not a dead end" moment (see DECISIONS.md). It's
 * the only place on the site the logo mark appears a second time, and
 * only because a real state change (finishing the sequence) earns it.
 */
const STEP_ICONS = [DesignIcon, ApprovalIcon, PrintIcon, InstallationIcon];

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
  const ActiveIcon = STEP_ICONS[activeIndex];
  const reduced = usePrefersReducedMotion();
  const enterStyle = reduced
    ? undefined
    : { animation: "process-step-in 400ms ease both" };

  return (
    <section id="process" className="bg-surface px-6 py-section md:px-12">
      <div className="mx-auto flex max-w-6xl flex-col gap-10">
        <Reveal>
          <div className="flex flex-col gap-3">
            <p className="font-mono text-step--1 uppercase tracking-label text-accent">Process</p>
            <h2 className="text-heading">How a job runs</h2>
            <p className="measure text-step-0 text-text-muted">
              Four steps, every time. Click through to watch a job take shape — the date we give
              you at step four is a promise, not an estimate.
            </p>
          </div>
        </Reveal>

        <Reveal index={1}>
          <div
            className="flex flex-col gap-8 md:flex-row md:items-center md:gap-12"
            onKeyDown={onKeyDown}
          >
            <div
              className="relative flex aspect-square w-full max-w-sm shrink-0 touch-pan-y items-center justify-center self-center overflow-hidden rounded border border-border bg-ground text-accent"
              onTouchStart={onTouchStart}
              onTouchEnd={onTouchEnd}
            >
              <div key={activeStep.step} style={enterStyle}>
                <ActiveIcon className="h-24 w-24 md:h-32 md:w-32" />
              </div>
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

function DesignIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
      <rect x="8" y="8" width="48" height="48" rx="2" strokeDasharray="4 4" />
      <path d="M8 32h48M32 8v48" strokeDasharray="2 4" opacity="0.5" />
      <path d="M18 44l10-18 8 10 6-8 4 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ApprovalIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
      <circle cx="32" cy="32" r="24" />
      <path d="M21 33l7 7 15-16" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PrintIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
      <rect x="12" y="14" width="40" height="9" />
      <rect x="12" y="27.5" width="40" height="9" opacity="0.7" />
      <rect x="12" y="41" width="40" height="9" opacity="0.4" />
    </svg>
  );
}

function InstallationIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
      <rect x="10" y="16" width="44" height="24" rx="1" />
      <path d="M32 40v8M22 56h20" strokeLinecap="round" />
      <path d="M20 24h24M20 32h16" strokeLinecap="round" opacity="0.6" />
    </svg>
  );
}
