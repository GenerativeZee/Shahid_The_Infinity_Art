import { create } from "zustand";
import type { Tier } from "./tier";

type HeroStore = {
  heroProgress: number;
  tier: Tier | null;
  setHeroProgress: (p: number) => void;
  setTier: (t: Tier) => void;
};

/**
 * The one number (§4.1). Written by lib/scroll.ts on every Lenis tick,
 * read imperatively via getState() inside useFrame — never subscribed to
 * reactively by the 3D scene, so scrolling never triggers a React re-render
 * of the hero.
 */
export const useHeroStore = create<HeroStore>((set) => ({
  heroProgress: 0,
  tier: null,
  setHeroProgress: (p) => set({ heroProgress: p }),
  setTier: (t) => set({ tier: t }),
}));
