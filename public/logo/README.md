# Logo assets

Real logo files from Shahid, delivered 2026-09-05.

- **`full.png`** — the complete logo as delivered (icon + "The Infinity
  Art" wordmark + "We Print What You Imagine" tagline + the gold
  "Designing | Branding | Printing" banner), downscaled to 1600px wide.
  Not used anywhere yet — kept here for the OG image, footer, and favicon
  work still open per `SPEC.md` §17.
- **`mark.png`** — just the icon, cropped out of the original file (which
  already had a transparent background, no chroma-keying needed). Used as
  the hero wordmark (`components/sections/Hero.tsx`), rendered as a CSS
  mask tinted with `--color-accent` rather than its own raster gradient,
  so it recolours along with the rest of the site if the accent ever
  changes. See `DECISIONS.md` for how the accent colour (`#c9a35a`) was
  sampled from this file.

Both are derived from the same source PNG the client sent
(`infinity logo .png`), not checked in at full resolution — these are
already large enough for any web use.
