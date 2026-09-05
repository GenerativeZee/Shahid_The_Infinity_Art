"use client";

import { useEffect } from "react";
import { getLenis } from "@/lib/scroll";
import { prefersReducedMotion } from "@/lib/tier";
import { applyTheme, blendThemes, themes, type ThemeName } from "@/lib/themeEngine";

/**
 * Scroll-driven theme morphing (v4 creative experiment — see DECISIONS.md).
 * Not React state: same discipline as useHeroProgress/useCardProgress. One
 * Lenis scroll listener, rAF-throttled, walks the page's [data-theme-zone]
 * markers and writes interpolated CSS custom properties straight onto
 * :root. Every component already reads those same variables via Tailwind's
 * @theme mapping, so nothing else needs to know a theme engine exists.
 */
export function ThemeEngine() {
  useEffect(() => {
    const zones = Array.from(document.querySelectorAll<HTMLElement>("[data-theme-zone]")).map(
      (el) => ({ el, theme: el.dataset.themeZone as ThemeName }),
    );
    if (zones.length === 0) return;

    const reduced = prefersReducedMotion();
    const lenis = getLenis();
    let rafId: number | null = null;

    function computeAndApply() {
      rafId = null;
      const viewportCenter = window.innerHeight / 2;
      const midpoints = zones.map(({ el }) => {
        const rect = el.getBoundingClientRect();
        return (rect.top + rect.bottom) / 2;
      });

      if (reduced) {
        // Nearest neighbour, no blend — themes still change per section,
        // but never mid-interpolation, per prefers-reduced-motion.
        let nearest = 0;
        let best = Infinity;
        for (let i = 0; i < midpoints.length; i++) {
          const d = Math.abs(midpoints[i] - viewportCenter);
          if (d < best) {
            best = d;
            nearest = i;
          }
        }
        applyTheme(themes[zones[nearest].theme]);
        return;
      }

      if (viewportCenter <= midpoints[0]) {
        applyTheme(themes[zones[0].theme]);
        return;
      }
      if (viewportCenter >= midpoints[midpoints.length - 1]) {
        applyTheme(themes[zones[zones.length - 1].theme]);
        return;
      }

      for (let i = 0; i < midpoints.length - 1; i++) {
        if (viewportCenter >= midpoints[i] && viewportCenter <= midpoints[i + 1]) {
          const span = midpoints[i + 1] - midpoints[i];
          const t = span <= 0 ? 1 : (viewportCenter - midpoints[i]) / span;
          applyTheme(blendThemes(themes[zones[i].theme], themes[zones[i + 1].theme], t));
          return;
        }
      }
    }

    function onScroll() {
      if (rafId === null) rafId = requestAnimationFrame(computeAndApply);
    }

    computeAndApply();
    lenis?.on("scroll", onScroll);
    window.addEventListener("resize", onScroll);

    return () => {
      lenis?.off("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, []);

  return null;
}
