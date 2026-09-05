"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Marker } from "@/components/theme/Marker";
import { usePrefersReducedMotion } from "@/lib/tier";
import type { DetailCategory, ProjectDetail } from "@/content/types";

/**
 * The Detail Index's one interaction: a marker on a Work project image
 * that opens a small placard-style panel answering one design question,
 * then dismisses. Level 2 in the brief's hierarchy — a contextual panel
 * laid over the lower edge of the image, deliberately not the full
 * `LookAgainReveal` dialog, so the visitor stays looking at the thing.
 *
 * Reuses `Marker` (interactive mode) for the pointer and the existing
 * `material-preview-in` keyframe for the panel — no new visual vocabulary,
 * no new CSS. Must be placed inside a `relative` element that is NOT
 * `overflow-hidden` (the panel sits at the image's bottom edge).
 */
const CATEGORY_LABEL: Record<DetailCategory, string> = {
  type: "Type",
  light: "Light",
  space: "Space",
  material: "Material",
  colour: "Colour",
  balance: "Balance",
  detail: "Detail",
};

export function DetailMarker({
  detail,
  projectName,
}: {
  detail: ProjectDetail;
  projectName: string;
}) {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();
  const reduced = usePrefersReducedMotion();
  const categoryLabel = CATEGORY_LABEL[detail.category];

  function dismiss() {
    setOpen(false);
    buttonRef.current?.focus();
  }

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") dismiss();
    }
    // A pointerdown anywhere outside the marker or the panel closes it —
    // the panel isn't modal (one control, short text), so this is the
    // dismissal, not a focus trap.
    function onPointerDown(e: Event) {
      const target = e.target as Node;
      if (
        !panelRef.current?.contains(target) &&
        !buttonRef.current?.contains(target)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open]);

  return (
    <>
      <Marker
        ref={buttonRef}
        xPercent={detail.marker.xPercent}
        yPercent={detail.marker.yPercent}
        label={detail.markerLabel}
        animate={false}
        interactive
        expanded={open}
        controls={panelId}
        accessibleName={`${detail.question} A ${categoryLabel.toLowerCase()} note on ${projectName}.`}
        onActivate={() => setOpen((o) => !o)}
      />

      {open ? (
        <div
          ref={panelRef}
          id={panelId}
          role="group"
          aria-label={`${categoryLabel} — ${projectName}`}
          style={reduced ? undefined : { animation: "material-preview-in 300ms ease-out" }}
          className="absolute inset-x-2 bottom-2 z-20 flex flex-col gap-1.5 rounded border border-accent/60 bg-ground/95 p-4"
        >
          <div className="flex items-start justify-between gap-3">
            <p className="font-mono text-[0.6rem] uppercase tracking-label text-accent">
              {categoryLabel}
            </p>
            <button
              ref={closeRef}
              type="button"
              onClick={dismiss}
              className="-m-1 shrink-0 rounded p-1 font-mono text-[0.6rem] uppercase tracking-label text-text-muted hover:text-text"
            >
              Close
            </button>
          </div>
          <p className="text-step--1 text-text">{detail.answer}</p>
        </div>
      ) : null}
    </>
  );
}
