"use client";

import { useEffect } from "react";
import { getLenis } from "@/lib/scroll";
import { useHeroStore } from "@/lib/store";

/**
 * Computes heroProgress (0-1) from the track element's position relative to
 * the viewport and writes it into the store. Registered on Lenis's own
 * scroll tick, which already runs inside Lenis's rAF loop — satisfies "no
 * more than once per animation frame" (§4.1) without a second throttle.
 */
export function useHeroProgress(trackRef: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const lenis = getLenis();
    const node = trackRef.current;
    if (!node) return;

    let last = -1;

    function update() {
      if (!node) return;
      const rect = node.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      const progress = total <= 0 ? 0 : Math.min(1, Math.max(0, -rect.top / total));
      if (progress !== last) {
        last = progress;
        useHeroStore.getState().setHeroProgress(progress);
      }
    }

    update();
    lenis?.on("scroll", update);
    window.addEventListener("resize", update);

    return () => {
      lenis?.off("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [trackRef]);
}
