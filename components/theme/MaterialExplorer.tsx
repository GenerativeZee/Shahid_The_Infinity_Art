"use client";

import { useRef, useState, useSyncExternalStore } from "react";
import type { MaterialSample } from "@/content/types";

const noopSubscribe = () => () => {};
function getIsTouch(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(hover: none)").matches;
}

/**
 * Evolves the old decorative marquee into a small material-exploration
 * interface (v4 interactive pass — see DECISIONS.md). Hovering/tapping a
 * material locally re-tints --color-accent (and a low-opacity ambient
 * wash) on this section's own wrapper, not on :root — the scroll-driven
 * ThemeEngine owns :root and is never touched, so there's nothing to
 * fight or restore when the preview ends.
 */
export function MaterialExplorer({ items }: { items: MaterialSample[] }) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<MaterialSample | null>(null);
  const isTouch = useSyncExternalStore(noopSubscribe, getIsTouch, () => false);

  function preview(material: MaterialSample) {
    sectionRef.current?.style.setProperty("--color-accent", material.accent);
    setActive(material);
  }

  function clearPreview() {
    sectionRef.current?.style.removeProperty("--color-accent");
    setActive(null);
  }

  // Hover-capable devices: mouseenter previews, mouseleave clears —
  // "touching" a material only lasts as long as the cursor is on it.
  // Touch has no leave event, so tapping the same material again is the
  // only way to dismiss it — the same click-vs-hover conflict this
  // component hit once already, fixed properly this time by branching
  // on device rather than overloading one handler for both.
  function onChipClick(material: MaterialSample) {
    if (!isTouch) {
      preview(material);
      return;
    }
    if (active?.name === material.name) {
      clearPreview();
    } else {
      preview(material);
    }
  }

  return (
    <div
      ref={sectionRef}
      className="material-explorer relative overflow-hidden border-b border-border py-6"
      style={{
        backgroundColor: active ? "color-mix(in srgb, var(--color-accent) 6%, transparent)" : undefined,
      }}
    >
      <div className="overflow-x-auto">
        <div className="marquee-track flex w-max gap-8 whitespace-nowrap font-mono text-step-0 uppercase tracking-label">
          {[...items, ...items].map((m, i) => {
            const isDuplicate = i >= items.length;
            return (
              <button
                key={i}
                type="button"
                aria-hidden={isDuplicate}
                tabIndex={isDuplicate ? -1 : 0}
                className="border-b border-dashed border-text-muted/40 pb-0.5 text-text-muted transition-colors duration-300 hover:border-accent hover:text-accent focus-visible:border-accent focus-visible:text-accent"
                onMouseEnter={() => !isTouch && preview(m)}
                onMouseLeave={() => !isTouch && clearPreview()}
                onFocus={() => preview(m)}
                onBlur={clearPreview}
                onClick={() => onChipClick(m)}
              >
                {m.name}
              </button>
            );
          })}
        </div>
      </div>

      <div
        className="mx-auto mt-4 flex min-h-10 max-w-6xl items-center gap-3 px-6 md:px-12"
        aria-live="polite"
      >
        {active ? (
          <div className="material-preview-in flex items-center gap-3">
            <span
              aria-hidden="true"
              className="h-8 w-8 shrink-0 rounded-full border border-border transition-colors duration-300"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(45deg, var(--color-accent) 0, var(--color-accent) 2px, transparent 2px, transparent 5px)",
              }}
            />
            <p className="text-step--1 text-text-muted">
              <span className="font-mono uppercase tracking-label text-accent">{active.name}</span>
              {" — "}
              {active.description}
            </p>
          </div>
        ) : (
          <p className="font-mono text-step--1 uppercase tracking-label text-text-muted/70">
            {isTouch ? "Tap a material to explore it" : "Hover a material to explore it"}
          </p>
        )}
      </div>
    </div>
  );
}
