"use client";

import { useEffect, useRef, useState } from "react";
import { Placeholder } from "@/components/ui/Placeholder";
import { prefersReducedMotion } from "@/lib/tier";
import type { ProjectImage } from "@/content/types";

/**
 * The site's one signature discovery moment (v4 interactive pass — see
 * DECISIONS.md). Deliberately singular: one card gets this, the rest get
 * the lighter "What changed?" hover cue in WorkGrid.tsx. Annotates general
 * craftsmanship principles, not fabricated claims about this specific
 * (placeholder) project — honest even before real photography exists.
 */
export function LookAgainReveal({
  image,
  projectName,
  details,
}: {
  image: ProjectImage;
  projectName: string;
  details: string[];
}) {
  const [open, setOpen] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  function openDialog() {
    setOpen(true);
    setRevealed(false);
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

      // Full focus trap: content changes when `revealed` flips (the
      // "Reveal details" button disappears), so the focusable set is
      // recomputed on every Tab press rather than cached once on open.
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
          {/* Always at least partially visible, same as the other cards'
              "What changed?" pill — a hover-only affordance is invisible
              and unreachable on touch. */}
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
              <h3 className="text-step-1 text-text">{projectName}</h3>
              <button
                ref={closeRef}
                type="button"
                onClick={closeDialog}
                className="shrink-0 rounded border border-border px-3 py-1 font-mono text-step--1 uppercase tracking-label text-text-muted hover:text-text"
              >
                Close
              </button>
            </div>

            <Placeholder filename={image.filename} aspect={image.aspect} className="rounded" />

            {!revealed ? (
              <button
                type="button"
                onClick={() => setRevealed(true)}
                className="w-fit rounded bg-accent px-5 py-3 font-mono text-step--1 uppercase tracking-label text-ground"
              >
                Reveal details
              </button>
            ) : (
              <div className="flex flex-col gap-3">
                <ul className="flex flex-col gap-2">
                  {details.map((detail, i) => (
                    <li
                      key={detail}
                      className="border-l-2 border-accent pl-3 font-mono text-step--1 text-text-muted"
                      style={
                        prefersReducedMotion()
                          ? undefined
                          : {
                              animation: `look-again-detail 500ms ease both`,
                              animationDelay: `${i * 120}ms`,
                            }
                      }
                    >
                      {detail}
                    </li>
                  ))}
                </ul>
                <p className="pt-2 text-step-0 text-text">Great design lives in the details.</p>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}
