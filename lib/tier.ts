import { useSyncExternalStore } from "react";

export type Tier = "A" | "B" | "C";

const noopSubscribe = () => () => {};

/**
 * SSR-safe reactive read of prefers-reduced-motion, via useSyncExternalStore
 * (same pattern as detectTier's own client/server split). Calling the plain
 * prefersReducedMotion() function directly in a render body is NOT
 * SSR-safe — it always returns false on the server, so a client whose real
 * preference is "reduce" hydrates with a mismatched value on first paint.
 * Prefer this hook in any component rendered during SSR (i.e. not behind
 * a next/dynamic ssr:false boundary).
 */
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(noopSubscribe, prefersReducedMotion, () => false);
}

type NavigatorConnection = {
  saveData?: boolean;
  effectiveType?: "slow-2g" | "2g" | "3g" | "4g";
};

type ExtendedNavigator = Navigator & {
  connection?: NavigatorConnection;
  deviceMemory?: number;
};

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function hasWebGL2(): boolean {
  if (typeof document === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2"));
  } catch {
    return false;
  }
}

/** Dev-only override so any tier can be tested on any machine (SPEC.md §9). */
function tierOverride(): Tier | null {
  if (typeof window === "undefined") return null;
  const value = new URLSearchParams(window.location.search).get("tier");
  return value === "A" || value === "B" || value === "C" ? value : null;
}

/**
 * Synchronous initial detection (SPEC.md §9) — must complete before first
 * paint of the hero. Missing APIs (Safari has no deviceMemory) are treated
 * as mid-range, never as high-end: guessing high is how you cook someone's
 * phone.
 *
 * The deviceMemory floor is <=2, not the spec's original <=4.
 * hardwareConcurrency stays at <=4, per spec. Chrome's Device Memory API
 * rounds actual RAM down to the nearest power of two, so most contemporary
 * phones with 4-6GB report exactly 4 — the original <=4 floor was silently
 * forcing the majority of real phones to tier C's static fallback
 * (confirmed live: a phone stuck on the tier-C poster rendered the full
 * tier-B scene fine once forced via ?tier=B). See DECISIONS.md.
 */
export function detectTier(): Tier {
  const override = tierOverride();
  if (override) return override;

  const nav = typeof navigator !== "undefined" ? (navigator as ExtendedNavigator) : undefined;
  const connection = nav?.connection;

  const isSlowConnection =
    connection?.saveData === true ||
    (connection?.effectiveType && ["slow-2g", "2g", "3g"].includes(connection.effectiveType));

  if (
    !hasWebGL2() ||
    prefersReducedMotion() ||
    isSlowConnection ||
    (nav?.deviceMemory !== undefined && nav.deviceMemory <= 2) ||
    (nav?.hardwareConcurrency !== undefined && nav.hardwareConcurrency <= 4)
  ) {
    return "C";
  }

  const isHighEnd =
    nav?.deviceMemory !== undefined &&
    nav.deviceMemory >= 8 &&
    nav?.hardwareConcurrency !== undefined &&
    nav.hardwareConcurrency >= 8 &&
    (typeof window === "undefined" || window.matchMedia("(pointer: fine)").matches);

  return isHighEnd ? "A" : "B";
}

const PROBE_FRAME_TARGET = 60;
const PROBE_MAX_MS = 2000;

/**
 * The live-probe insurance (SPEC.md §9). Samples frame durations after the
 * scene mounts and reports the median FPS once enough samples exist —
 * capped by time as well as frame count, since 60 frames at a genuinely bad
 * framerate would otherwise take longer than the ~2s the probe is meant to
 * react within (§16 acceptance check). Measured frame time is the real
 * safety net for tier detection; the static checks above only need to
 * catch genuinely low-end hardware, not gate the whole mid-range.
 */
export function probeFps(onResult: (medianFps: number) => void, override?: Tier | null): () => void {
  if (override) return () => {};
  if (typeof window === "undefined") return () => {};

  const durations: number[] = [];
  let lastTime = performance.now();
  let rafId: number;
  const startTime = lastTime;

  function tick(time: number) {
    durations.push(time - lastTime);
    lastTime = time;

    const elapsed = time - startTime;
    if (durations.length >= PROBE_FRAME_TARGET || elapsed >= PROBE_MAX_MS) {
      const sorted = [...durations].sort((a, b) => a - b);
      const medianMs = sorted[Math.floor(sorted.length / 2)];
      onResult(1000 / medianMs);
      return;
    }
    rafId = requestAnimationFrame(tick);
  }

  rafId = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(rafId);
}

/** One-way downgrade only (SPEC.md §9) — never upgrade mid-session. */
export function downgradeFor(tier: Tier, medianFps: number): Tier | null {
  if (tier === "A" && medianFps < 40) return "B";
  if (tier === "B" && medianFps < 25) return "C";
  return null;
}
