"use client";

import { useEffect, useRef } from "react";
import { getLenis } from "@/lib/scroll";

/**
 * A local 0-1 progress value for the wedding card, kept in a ref rather
 * than React state — this is read imperatively inside the card's useFrame,
 * same discipline as heroProgress: scrolling must never trigger a React
 * re-render of the 3D scene (§4.1).
 */
export function useCardProgress(ref: React.RefObject<HTMLElement | null>) {
  const progressRef = useRef(0);

  useEffect(() => {
    const lenis = getLenis();
    const node = ref.current;
    if (!node) return;

    function update() {
      if (!node) return;
      const rect = node.getBoundingClientRect();
      const vh = window.innerHeight;
      const raw = (vh - rect.top) / (vh * 0.7 + rect.height * 0.3);
      progressRef.current = Math.min(1, Math.max(0, raw));
    }

    update();
    lenis?.on("scroll", update);
    window.addEventListener("resize", update);

    return () => {
      lenis?.off("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [ref]);

  return progressRef;
}
