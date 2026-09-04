import gsap from "gsap";

export type HeroBeatState = {
  cameraX: number;
  cameraY: number;
  cameraZ: number;
  plateOffset: number;
  boardThickness: number;
  letterDepth: number;
  ledIntensity: number;
  envIntensity: number;
  boardRotY: number;
  wallOpacity: number;
  shadowOpacity: number;
  bloomIntensity: number;
  pullBackReveal: number;
};

export function createHeroBeatState(): HeroBeatState {
  return {
    cameraX: 0,
    cameraY: 0,
    cameraZ: 6,
    plateOffset: 0.06,
    boardThickness: 0.02,
    letterDepth: 0,
    ledIntensity: 0,
    envIntensity: 1.0,
    boardRotY: -0.25,
    wallOpacity: 0,
    shadowOpacity: 0,
    bloomIntensity: 0,
    pullBackReveal: 0,
  };
}

/**
 * One paused timeline holding all five beats (§4.1, §6). Never played —
 * `timeline.progress(heroProgress)` is called every time heroProgress
 * changes, turning GSAP into a pure interpolation engine. Segment
 * durations are fractions of a 1-"second" total (0.15 + 0.25 + 0.20 + 0.20
 * + 0.20 = 1), so `progress()` maps 0-1 directly onto heroProgress with no
 * conversion.
 */
export function createHeroTimeline(state: HeroBeatState): gsap.core.Timeline {
  const tl = gsap.timeline({ paused: true });

  // Beat 1, 0.00 -> 0.15: flat artwork — CMYK plates register into one image.
  tl.to(state, { plateOffset: 0, duration: 0.15, ease: "none" }, 0);

  // Beat 2, 0.15 -> 0.40: material arrives — depth appears, camera starts its orbit.
  tl.to(
    state,
    {
      letterDepth: 0.14,
      boardThickness: 0.09,
      cameraX: 1.2,
      cameraY: 0.4,
      cameraZ: 4.6,
      duration: 0.25,
      ease: "none",
    },
    0.15,
  );

  // Beat 3, 0.40 -> 0.60: light on — LED ramps up as the world darkens around it.
  tl.to(
    state,
    {
      ledIntensity: 3.2,
      envIntensity: 0.35,
      bloomIntensity: 0.9,
      cameraX: 0.6,
      cameraY: 0.1,
      cameraZ: 4.0,
      duration: 0.2,
      ease: "none",
    },
    0.4,
  );

  // Beat 4, 0.60 -> 0.80: mounted — board settles flat against the wall.
  tl.to(
    state,
    {
      boardRotY: 0,
      wallOpacity: 1,
      shadowOpacity: 0.6,
      cameraX: 0,
      cameraY: -0.3,
      cameraZ: 3.2,
      duration: 0.2,
      ease: "none",
    },
    0.6,
  );

  // Beat 5, 0.80 -> 1.00: pull back — camera retreats, the portfolio wall reveals.
  tl.to(
    state,
    {
      cameraX: 0,
      cameraY: 0,
      cameraZ: 11,
      pullBackReveal: 1,
      duration: 0.2,
      ease: "none",
    },
    0.8,
  );

  return tl;
}
