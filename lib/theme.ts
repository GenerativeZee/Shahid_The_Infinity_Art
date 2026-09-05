/**
 * Reads the accent colour from the single CSS variable in app/globals.css
 * at runtime, so the 3D scene never hardcodes it separately — changing the
 * accent stays a one-line edit (§16 acceptance check) even though three.js
 * needs a concrete hex string, not a CSS var reference.
 */
export function getAccentColor(fallback = "#c9a35a"): string {
  if (typeof window === "undefined") return fallback;
  const value = getComputedStyle(document.documentElement).getPropertyValue("--color-accent").trim();
  return value || fallback;
}
