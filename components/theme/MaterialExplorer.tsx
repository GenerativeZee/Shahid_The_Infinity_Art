"use client";

import { useRef, useState } from "react";
import type { MaterialSample } from "@/content/types";

/**
 * Evolves the old decorative marquee into a small material-exploration
 * interface (v4 interactive pass — see DECISIONS.md). Hovering/tapping a
 * material locally re-tints --color-accent on this section's own wrapper,
 * not on :root — the scroll-driven ThemeEngine owns :root and is never
 * touched, so there's nothing to fight or restore when the preview ends.
 */
export function MaterialExplorer({ items }: { items: MaterialSample[] }) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<MaterialSample | null>(null);

  function preview(material: MaterialSample) {
    sectionRef.current?.style.setProperty("--color-accent", material.accent);
    setActive(material);
  }

  function clearPreview() {
    sectionRef.current?.style.removeProperty("--color-accent");
    setActive(null);
  }

  return (
    <div ref={sectionRef} className="border-b border-border py-6">
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
                className="text-text-muted transition-colors duration-300 hover:text-accent focus-visible:text-accent"
                onMouseEnter={() => preview(m)}
                onMouseLeave={clearPreview}
                onFocus={() => preview(m)}
                onBlur={clearPreview}
                onClick={() => preview(m)}
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
          <>
            <span
              aria-hidden="true"
              className="h-8 w-8 shrink-0 rounded-full border border-border transition-colors duration-300"
              style={{ backgroundColor: "var(--color-accent)" }}
            />
            <p className="text-step--1 text-text-muted">
              <span className="font-mono uppercase tracking-label text-accent">{active.name}</span>
              {" — "}
              {active.description}
            </p>
          </>
        ) : (
          <p className="font-mono text-step--1 uppercase tracking-label text-text-muted/70">
            Hover or tap a material to explore it
          </p>
        )}
      </div>
    </div>
  );
}
