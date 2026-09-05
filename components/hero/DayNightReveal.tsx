"use client";

import { useEffect, useRef } from "react";

/**
 * SPEC.md §5.1. Two placeholder layers stand in for the real day/night
 * shopfront pair (see public/media/README.md — Shahid is shooting these
 * himself, not yet delivered). The reveal mechanism itself is real: the
 * night layer is masked by a radial-gradient whose --x/--y/--r custom
 * properties are mutated directly on the DOM node (never through React
 * state — a mousemove can't be allowed to cause a re-render).
 */
export function DayNightReveal() {
  const containerRef = useRef<HTMLDivElement>(null);
  const nightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const night = nightRef.current;
    if (!container || !night) return;

    if (window.matchMedia("(hover: none)").matches) {
      night.classList.add("day-night-reveal__night--sweep");
      return;
    }

    let rafId: number | null = null;
    let pending: { x: number; y: number } | null = null;
    let revealed = false;

    function apply() {
      rafId = null;
      if (!pending) return;
      if (!revealed) {
        night!.style.setProperty("--r", "var(--reveal-radius)");
        revealed = true;
      }
      night!.style.setProperty("--x", `${pending.x}px`);
      night!.style.setProperty("--y", `${pending.y}px`);
    }

    function onMove(e: PointerEvent) {
      const rect = container!.getBoundingClientRect();
      pending = { x: e.clientX - rect.left, y: e.clientY - rect.top };
      if (rafId === null) rafId = requestAnimationFrame(apply);
    }

    container.addEventListener("pointermove", onMove);
    return () => {
      container.removeEventListener("pointermove", onMove);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden">
      <PlaceholderLayer filename="hero/hero-day.jpg" tone="day" />
      <div ref={nightRef} className="day-night-reveal__night pointer-events-none absolute inset-0">
        <PlaceholderLayer filename="hero/hero-night.jpg" tone="night" />
      </div>
    </div>
  );
}

/**
 * A bespoke placeholder for the two full-bleed hero layers — deliberately
 * not the grid-oriented components/ui/Placeholder.tsx (its fixed aspect
 * ratio doesn't fit a layer that must fill an arbitrary hero height), but
 * the same "obviously fake, labelled" visual language (SPEC.md §11.4),
 * tinted per layer so day vs night is legible even before real photos land.
 */
function PlaceholderLayer({ filename, tone }: { filename: string; tone: "day" | "night" }) {
  const isNight = tone === "night";
  return (
    <div
      role="img"
      aria-label={`Placeholder image: ${filename}`}
      className={`absolute inset-0 flex items-center justify-center overflow-hidden ${
        isNight ? "bg-ground" : "bg-accent/20"
      }`}
    >
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, var(--color-accent) 0, var(--color-accent) 1px, transparent 1px, transparent 12px)",
          opacity: isNight ? 0.4 : 0.25,
        }}
      />
      <span className="relative z-10 px-3 text-center font-mono text-xs uppercase tracking-label text-accent">
        {filename}
      </span>
    </div>
  );
}
