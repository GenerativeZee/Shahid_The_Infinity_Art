export type ThemeName = "nocturne" | "verdigris" | "ember" | "signal";

export type ThemeTokens = {
  ground: string;
  surface: string;
  surfaceRaised: string;
  border: string;
  accent: string;
  textMuted: string;
};

/**
 * Four dark-based palettes, one per section "chapter" — deliberately not
 * including a light theme (see DECISIONS.md): this site's actual subject is
 * blue-hour/LED photography shot for a dark background, and a light section
 * would make that photography read wrong. --color-text stays constant across
 * every theme (not defined here) so body-copy contrast is never a variable.
 */
export const themes: Record<ThemeName, ThemeTokens> = {
  nocturne: {
    ground: "#080c0e",
    surface: "#10161a",
    surfaceRaised: "#161e23",
    border: "#1e2a30",
    accent: "#c9a35a",
    textMuted: "#94a3a8",
  },
  verdigris: {
    ground: "#070d0d",
    surface: "#0d1716",
    surfaceRaised: "#13201f",
    border: "#1c2e2b",
    accent: "#4fd1b0",
    textMuted: "#8fa8a3",
  },
  ember: {
    ground: "#100a08",
    surface: "#1a120d",
    surfaceRaised: "#221811",
    border: "#2e2015",
    accent: "#cc8b5c",
    textMuted: "#ad9a8c",
  },
  signal: {
    ground: "#0a0708",
    surface: "#150e10",
    surfaceRaised: "#1d1315",
    border: "#2c1a1d",
    accent: "#d9614c",
    textMuted: "#a89294",
  },
};

const TOKEN_TO_CSS_VAR: Record<keyof ThemeTokens, string> = {
  ground: "--color-ground",
  surface: "--color-surface",
  surfaceRaised: "--color-surface-raised",
  border: "--color-border",
  accent: "--color-accent",
  textMuted: "--color-text-muted",
};

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  return `#${[clamp(r), clamp(g), clamp(b)].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

function lerpColor(a: string, b: string, t: number): string {
  const [ar, ag, ab] = hexToRgb(a);
  const [br, bg, bb] = hexToRgb(b);
  return rgbToHex(ar + (br - ar) * t, ag + (bg - ag) * t, ab + (bb - ab) * t);
}

/** Blends two theme token sets by `t` (0 = fully `a`, 1 = fully `b`). */
export function blendThemes(a: ThemeTokens, b: ThemeTokens, t: number): ThemeTokens {
  return {
    ground: lerpColor(a.ground, b.ground, t),
    surface: lerpColor(a.surface, b.surface, t),
    surfaceRaised: lerpColor(a.surfaceRaised, b.surfaceRaised, t),
    border: lerpColor(a.border, b.border, t),
    accent: lerpColor(a.accent, b.accent, t),
    textMuted: lerpColor(a.textMuted, b.textMuted, t),
  };
}

/** Writes a token set directly onto :root — never through React state. */
export function applyTheme(tokens: ThemeTokens, target: HTMLElement = document.documentElement) {
  for (const key of Object.keys(TOKEN_TO_CSS_VAR) as (keyof ThemeTokens)[]) {
    target.style.setProperty(TOKEN_TO_CSS_VAR[key], tokens[key]);
  }
}
