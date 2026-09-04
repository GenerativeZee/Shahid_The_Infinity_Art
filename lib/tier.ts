export type Tier = "A" | "B" | "C";

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

/** Dev-only override so any tier can be tested on any machine (§14). */
function tierOverride(): Tier | null {
  if (typeof window === "undefined") return null;
  const value = new URLSearchParams(window.location.search).get("tier");
  return value === "A" || value === "B" || value === "C" ? value : null;
}

/**
 * Synchronous initial detection (§5.1) — must complete before first paint
 * of the hero. Missing APIs (Safari has no deviceMemory) are treated as
 * mid-range, never as high-end: guessing high is how you cook someone's
 * phone.
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
    (nav?.deviceMemory !== undefined && nav.deviceMemory <= 4) ||
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

const PROBE_FRAME_TARGET = 90;
const PROBE_MAX_MS = 2000;

/**
 * The live-probe insurance (§5.2). Samples frame durations after the scene
 * mounts and reports the median FPS once enough samples exist — capped by
 * time as well as frame count, since 90 frames at a genuinely bad framerate
 * would otherwise take longer than the ~2s the probe is meant to react
 * within (§16 acceptance check).
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

/** One-way downgrade only (§5.2) — never upgrade mid-session. */
export function downgradeFor(tier: Tier, medianFps: number): Tier | null {
  if (tier === "A" && medianFps < 45) return "B";
  if (tier === "B" && medianFps < 25) return "C";
  return null;
}
