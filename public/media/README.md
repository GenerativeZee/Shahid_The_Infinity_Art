# Media

Real photography does not exist yet. `work/` and `wedding/hero-flatlay.jpg`
are currently filled with **free Unsplash sample photos** (see
`ATTRIBUTION.md` in this directory) so the site can be reviewed at full
visual fidelity instead of showing text placeholders — they are generic
stock images, not real client work, and every business name/location in
`content/site.ts` stays fictional regardless. `hero-seq/` still has no
files, so the hero's tier-C/no-JS fallback still renders
`components/ui/Placeholder.tsx` (an obvious accent-coloured block with the
expected filename printed on it).

Drop real files in at the paths below with the exact filenames already
referenced in `content/site.ts` — `components/ui/SiteImage.tsx` renders
whatever is on disk via `next/image`, so swapping the stock JPEGs for real
photography is just overwriting the file, no code change needed.

## Shoot brief

Book this shoot before M2 (real photography drop-in). Bring a wide lens for
shopfronts and a macro/close lens for finish detail.

1. **15–20 installed boards.** Three frames each:
   - Wide, with the shopfront/street context
   - Straight-on, board filling the frame
   - Close detail of the edge and finish (this is what sells "real fabricated
     object" — do not skip it)
2. **Five LED or glow signs, at blue hour** (the ~20 minutes after sunset).
   These are the hero images of the entire site — the dark art direction has
   nothing to stand on without them. Highest priority in the shoot.
3. **Wedding cards:**
   - Flat lay on textured paper
   - One angled shot, shallow depth of field
   - One open, showing the inserts
4. **The workshop:** printer running, vinyl being weeded, hands applying
   material.
5. **Ten seconds of video** of the print head crossing, for a silent loop.
6. **One portrait of Shahid.** People buy from a person in this trade.

## Directory layout

```
public/media/
  work/            installed boards, wedding cards, print, digital — see
                   content/site.ts `projects[].image.filename` for exact names
  hero-seq/        hero_0001.webp … hero_0072.webp, tier C scrubbed sequence
                   (added in M3, see DECISIONS.md)
  placeholders/    reserved — not currently used; Placeholder.tsx renders
                   in-DOM, no image asset needed
```

## Expected filenames and aspect ratios (Work section)

Kept in sync with `content/site.ts`. If you add or rename a project there,
update this table.

| Filename | Aspect | Notes |
|---|---|---|
| `work/umiya-traders-acp-wide.jpg` | 4:3 | ACP shopfront board, wide with shopfront |
| `work/patel-medical-flex-wide.jpg` | 4:3 | Star flex clinic board, wide |
| `work/royal-sweets-led-dusk.jpg` | 4:3 | Cast acrylic LED sign, blue hour |
| `work/mehta-wedding-card-flatlay.jpg` | 1:1 | Wedding card flat lay |
| `work/shah-enterprises-cards.jpg` | 4:3 | Visiting card set |
| `work/greenleaf-website.jpg` | 16:9 | Website on a laptop |
| `work/anand-motors-acp-detail.jpg` | 3:4 | ACP board, close edge detail |
| `work/sunrise-bakery-glow-dusk.jpg` | 4:3 | LED glow sign, blue hour |

## Hero frame sequence (tier C, added at M3)

`hero_0001.webp` … `hero_0072.webp`, 1500×1125, WebP quality 80, ≤18 KB per
frame, ≤1.4 MB total. Frame 1 doubles as the static poster image for every
tier and the `prefers-reduced-motion` fallback. Rendered offline in Blender —
see the main spec, §8.
