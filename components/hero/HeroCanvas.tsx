"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Scene } from "./Scene";
import { downgradeFor, probeFps, type Tier } from "@/lib/tier";
import { useHeroStore } from "@/lib/store";

/**
 * frameloop is "always" only for the ~2s live-probe window right after
 * mount (so the FPS sample reflects real render cost, §5.2), then drops to
 * "demand" — rendering only when something invalidates it (heroProgress
 * changing, via Scene's InvalidateOnProgress) — and "never" once the
 * canvas leaves the viewport or the tab is hidden (§4.2).
 */
export function HeroCanvas({ tier: initialTier }: { tier: "A" | "B" }) {
  const [tier, setTier] = useState<"A" | "B" | "C">(initialTier);
  const [probing, setProbing] = useState(true);
  const [active, setActive] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    useHeroStore.getState().setTier(tier);
  }, [tier]);

  useEffect(() => {
    const stop = probeFps((medianFps) => {
      setProbing(false);
      setTier((current) => {
        if (current === "C") return current;
        return downgradeFor(current as Tier, medianFps) ?? current;
      });
    });
    return stop;
  }, []);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(([entry]) => setActive(entry.isIntersecting), {
      threshold: 0,
    });
    observer.observe(node);

    function onVisibility() {
      setActive(!document.hidden);
    }
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  if (tier === "C") {
    // Downgraded below live 3D mid-session. Stopping the live scene reads
    // better than swapping engines under the visitor mid-scroll — the
    // poster placeholder underneath (rendered by HeroStage) still shows.
    return null;
  }

  const frameloop = !active ? "never" : probing ? "always" : "demand";

  return (
    <div ref={containerRef} className="absolute inset-0">
      <Canvas
        frameloop={frameloop}
        dpr={tier === "A" ? [1, 2] : [1, 1.25]}
        gl={{ antialias: tier === "A" }}
      >
        <Suspense fallback={null}>
          <Scene tier={tier} />
        </Suspense>
      </Canvas>
    </div>
  );
}
