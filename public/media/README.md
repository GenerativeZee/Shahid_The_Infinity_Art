# Media

Real photography does not exist yet. Every image reference in
`content/site.ts` renders as an obvious accent-coloured placeholder block
with the expected filename printed on it (`components/ui/Placeholder.tsx`)
— never stock photography, per `SPEC.md` §11.2 and §11.4. An earlier
version of this content used AI-sourced Unsplash stock photos as visual
stand-ins for portfolio work and the wedding card; that was reverted (see
`DECISIONS.md`, "Spec revision — redesign branch") because it's exactly
what §11.2 rules out — a placeholder must be obviously a placeholder, not
something that could be mistaken for real client work.

Drop real files in at the paths below with the exact filenames already
referenced in `content/site.ts` and the placeholders disappear on their
own once a real `<img>`/`srcset` pipeline replaces `Placeholder.tsx` (the
`sharp`-based pipeline in `SPEC.md` §4.1, planned for R3).

## Shoot brief (`SPEC.md` §11.5)

Bring a wide lens for shopfronts and a macro/close lens for finish detail.

1. **15–20 installed boards.** Three frames each:
   - Wide, with the shopfront/street context
   - Straight-on, board filling the frame
   - Close detail of the edge and finish (this is what sells "real fabricated
     object" — do not skip it)
2. **Five LED or glow signs, at blue hour** (the ~20 minutes after sunset).
   These are the hero images of the entire site — the dark art direction has
   nothing to stand on without them. Highest priority in the shoot.
3. **The day/night pair (`SPEC.md` §11.3, §5.1) — highest priority, needed
   before R1.** One shopfront, tripod/phone locked in a single position:
   one frame in daylight, one after dark with the sign lit. See "Day/night
   pair delivery" below for the exact framing and dimensions this needs.
4. **Wedding cards:**
   - Flat lay on textured paper
   - One angled shot, shallow depth of field
   - One open, showing the inserts
5. **The workshop:** printer running, vinyl being weeded, hands applying
   material.
6. **Ten seconds of video** of the print head crossing, for a silent loop.
7. **One portrait of Shahid.** People buy from a person in this trade.
8. **Material close-ups** — ACP, acrylic edge, star-flex weave, 300 GSM. A
   phone and daylight beat any stock texture; these are the actual
   materials being sold.

## Day/night pair delivery — read before shooting (needed for R1)

- **Camera position must not move between the two shots.** Lock the phone
  down (tripod, or braced on something solid) and take both frames from
  the exact same spot, same framing, same zoom. The reveal effect (§5.1)
  masks between the two images pixel-for-pixel — any shift between them
  will show as a visible seam under the cursor.
- **Framing:** landscape, the whole shopfront frontage in frame with a
  little headroom above the sign — this fills the full hero viewport
  behind the wordmark (§5.2), so avoid tight crops that would clip when
  stretched to a wide desktop window.
- **Aspect ratio:** 16:9 preferred (matches the hero viewport best on both
  phone and desktop). If that's awkward to shoot, any consistent
  landscape ratio works — just keep both shots identical.
- **Resolution:** whatever the phone shoots at full quality is plenty —
  this gets resized/compressed for the web at build time, so don't worry
  about file size.
- **Day shot:** normal daylight, sign off.
- **Night shot:** after dark, sign fully lit/glowing — this is the "wow"
  half of the reveal, so make sure the glow actually reads clearly against
  the dark surroundings.
- **Filenames:** `hero-day.jpg` and `hero-night.jpg` (exact names, used
  directly in code) — drop them in `public/media/hero/` (new folder,
  create it) once shot.

## Directory layout

```
public/media/
  work/            installed boards, wedding cards, print, digital — see
                   content/site.ts `projects[].image.filename` for exact names
  wedding/         wedding card fold's static (tier-C) fallback image
  hero/            hero-day.jpg / hero-night.jpg, the §5.1 day/night pair
                   (not yet delivered — see "Day/night pair delivery" above)
  hero-seq/        board-fabrication scroll sequence (§8.2) — currently
                   unused; scaffolding frames baked from the existing R3F
                   scene land here at R4, explicitly not final quality
                   (see DECISIONS.md)
  placeholders/    reserved — not currently used; Placeholder.tsx renders
                   in-DOM, no image asset needed
```

## Expected filenames and aspect ratios (Work section)

Kept in sync with `content/site.ts`. If you add or rename a project there,
update this table.

| Filename | Aspect | Notes |
|---|---|---|
| `work/acp-shopfront-board-wide.jpg` | 4:3 | ACP shopfront board, wide with shopfront |
| `work/star-flex-clinic-board-wide.jpg` | 4:3 | Star flex clinic board, wide |
| `work/cast-acrylic-led-sign-dusk.jpg` | 4:3 | Cast acrylic LED sign, blue hour |
| `work/wedding-invitation-suite-flatlay.jpg` | 1:1 | Wedding card flat lay |
| `work/visiting-card-set.jpg` | 4:3 | Visiting card set |
| `work/business-website.jpg` | 16:9 | Website on a laptop |
| `work/acp-signboard-two-panel-detail.jpg` | 3:4 | ACP board, close edge detail |
| `work/led-glow-sign-dusk.jpg` | 4:3 | LED glow sign, blue hour |
| `wedding/hero-flatlay.jpg` | 4:3 | Wedding card fold's static (tier-C) fallback |

## Hero frame sequence (`hero-seq/`, planned for R4)

`hero_0001.webp` … `hero_0072.webp` (120 on desktop), 1500×1125, WebP
quality 80, ≤18 KB per frame, ≤1.4 MB total (§8.2, §10). Frame 1 doubles as
the static poster image for every tier and the `prefers-reduced-motion`
fallback. The shipping version is rendered offline in Blender — but the
first version to land here (R4) is scaffolding baked from the existing
R3F hero scene, explicitly not final quality; see `DECISIONS.md`.
