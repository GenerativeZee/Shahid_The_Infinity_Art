"use client";

import dynamic from "next/dynamic";
import { useSyncExternalStore } from "react";
import { Placeholder } from "@/components/ui/Placeholder";
import { detectTier } from "@/lib/tier";

const HeroCanvas = dynamic(() => import("./HeroCanvas").then((m) => m.HeroCanvas), {
  ssr: false,
  loading: () => null,
});

const POSTER = { filename: "hero-seq/hero_0001.webp", aspect: "4/3" as const };

/**
 * Frame 1 doubles as the poster for every tier (§8) — it renders first and
 * the live canvas fades in over it (§11), so it's always in the DOM
 * underneath, never swapped out.
 *
 * Tier C would drive a scrubbed image sequence here, but the real frames
 * don't exist yet (no Blender render pass has run — see DECISIONS.md), so
 * it degrades to the same static poster. detectTier() already folds
 * prefers-reduced-motion into tier C (§5.1), so that degrade is also
 * exactly the correct behaviour for reduced-motion visitors (§5.3) — a
 * single static image, no scrubbing, for the right structural reason.
 */
const noopSubscribe = () => () => {};

export function HeroStage() {
  // Tier detection reads client-only APIs (WebGL, navigator.connection, …)
  // and must genuinely differ between server and client — useSyncExternalStore
  // is React's sanctioned way to do that without a hydration-mismatch
  // warning or an extra setState-in-effect render.
  const tier = useSyncExternalStore(noopSubscribe, detectTier, () => null);

  return (
    <>
      <Placeholder {...POSTER} className="absolute inset-0 h-full w-full" />
      {tier === "A" || tier === "B" ? <HeroCanvas tier={tier} /> : null}
    </>
  );
}
