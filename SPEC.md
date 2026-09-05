# The Infinity Art — website spec

This is the governing spec for this build, superseding all prior planning
docs. Where this spec gives an exact value, use it. Where it doesn't, ask —
do not invent one. Changes to this document (like §9's tier thresholds
below) are logged with their reasoning in `DECISIONS.md`, not silently
edited away.

## 1. Context

**The client.** The Infinity Art — a design, printing and branding studio in
India run by Shahid. The shop makes signage (flex, star flex, vinyl, ACP
boards, cast-acrylic letters, LED glow signs), print work (visiting cards,
brochures, standees), wedding invitations, logo and brand identity work, and
websites and apps.

**Who visits.** Local business owners, shopkeepers, doctors and clinics,
wedding families, small companies — overwhelmingly on mid-range Android
phones, on 4G, often outdoors in daylight. A minority on desktop.

**What the site must achieve, in this order:** produce a WhatsApp enquiry,
and make the visitor ask "kahaan se banwaayi? hamari bhi bana de." Both, not
one.

## 2. The two rules that govern every decision

**One.** A site that takes six seconds to appear on a ₹12,000 Android has
failed commercially, however good it looks on a laptop. When the choice is
between "looks slightly better" and "loads on a mid-range phone", loading
wins.

**Two.** Where this spec gives an exact value, use it. Where it doesn't,
ask — do not invent one. A spec that describes architecture and leaves the
design open produces a competent, forgettable site, because unspecified
gaps get filled with the average of everything you have seen. That is the
failure this document exists to prevent.

## 3. What the site is

The hero is a shopfront that lights up under the visitor's cursor — the
same building, day and night, with the night frame revealed through a
moving mask (§5.1). Below it, a short scroll-scrubbed sequence of a board
being made: flat artwork → material and depth → LED on → mounted on a wall
→ pulled back into a wall of real work.

That sequence is pre-rendered frames, not live WebGL. Real-time 3D is an
optional tier-A enhancement and must justify itself (§8.3). Pre-rendered
frames can be lit properly and cost nothing at runtime; a live scene needs
art direction that is easy to get wrong and expensive to ship.

The wow is not the technology. It is that a signage shop can show you what
your board looks like when it turns on.

## 4. Stack — decided, do not substitute

| Layer | Choice |
|---|---|
| Framework | Next.js, App Router, TypeScript, `output: 'export'` (static) |
| Styling | Tailwind CSS over a small CSS-variable token layer |
| Smooth scroll | lenis |
| Sequencing | gsap, one paused timeline scrubbed by scroll progress — lazy-loaded, never in the main bundle |
| State | zustand, one small store |
| Images | A build-time `sharp` script → AVIF + WebP responsive variants. No `next/image` (see §4.1) |
| Optional 3D | three + @react-three/fiber + @react-three/drei, dynamically imported, tier A only |
| Offline renders | Blender |
| Hosting | Cloudflare Pages (see §4.2) |

No CMS, no i18n framework, no component library, no animation library
beyond GSAP.

### 4.1 Images

`next/image` cannot optimise on a static export, and `unoptimized: true`
ships its runtime for no benefit. Instead: a build script using `sharp`
generates AVIF and WebP at 390 / 768 / 1200 / 1600 px plus a base64 LQIP for
every photograph, and components render plain `<img>` with `srcset`,
`sizes`, explicit `width`/`height`, `loading="lazy"` and
`decoding="async"`. Zero runtime JS, works on any host, and allows a
different crop for mobile.

### 4.2 Hosting

Cloudflare Pages, free tier: unmetered static bandwidth, edge presence
across India, 500 builds/month, and the quote endpoint fits inside the free
Functions allowance. Vercel's Hobby plan forbids commercial use and Pro
costs roughly ₹21,000/year for server features a static site never uses.

## 5. Signature moments — every value here is decided

This is the design. Implement it exactly.

### 5.1 Day → night reveal — the hero

Two frames of the same shopfront from the same camera position: one
daylight, one after dark with the sign lit.

- Base layer: the day frame. `position:absolute; inset:0; background-size:cover; background-position:center;`
- Reveal layer directly above: the night frame, `pointer-events:none`, masked.
- Mask, set on both `-webkit-mask-image` and `mask-image`:
  `radial-gradient(circle var(--r) at var(--x) var(--y), #fff 0%, #fff 38%, rgba(255,255,255,.72) 58%, rgba(255,255,255,.35) 74%, rgba(255,255,255,.10) 88%, transparent 100%)`
- Initial: `--x:-999px; --y:-999px; --r:0px` — nothing revealed until interaction.
- Radius: 130px below 480px viewport width, 175px below 720px, else 280px.
- Desktop: update `--x` / `--y` from `mousemove` relative to the layer's bounding rect, written inside a `requestAnimationFrame`, never directly in the handler.
- Touch has no cursor. Under `(hover: none)`, animate the mask centre along a slow horizontal path across the sign — 9s, ease-in-out, infinite alternate. This ships; it is not a fallback.
- `prefers-reduced-motion: reduce` → night frame at full opacity, unmasked.

### 5.2 Type at architectural scale

- Hero wordmark: `clamp(3rem, 17vw, 15rem)`, weight 800, uppercase, `letter-spacing:-0.03em`, `line-height:0.92`, `white-space:nowrap`, in an `overflow:hidden` wrapper.
- Section headings: `clamp(2.5rem, 11vw, 8rem)`.
- The hero board photograph overlaps the wordmark — wordmark `z-index:1`, photo `z-index:2`. The type is architecture the subject stands in front of, not a caption.

### 5.3 Word-by-word entrance

One `<span>` per word. Each starts `opacity:0; transform:translateY(20px)`,
animates to `opacity:1; translateY(0)` over 550ms ease, staggered
`index * 0.09s`. Fired once by `IntersectionObserver` at threshold 0.2,
then unobserved. Never replays on scroll back.

### 5.4 Opposing material marquees

Two rows of close-up material photographs — brushed ACP, a cast-acrylic
edge, 3M vinyl, star-flex weave, 300 GSM stock. Row one translates +X with
scroll, row two −X. Offset `(scrollY - sectionTop + innerHeight) * 0.28`.
Tiles 380 × 240, `gap: 12px`, `border-radius: 14px`, contents tripled for
seamless wrap, `will-change: transform`, passive listener, lazy images.

### 5.5 Stacking project cards

The portfolio is a stack, not a grid. Each card `position: sticky; top:
7rem`, inside an `85vh` container. As the next arrives, card N scales to
`1 - (total - 1 - index) * 0.03` and offsets `top: index * 26px`. Card:
`border: 2px solid accent`, `border-radius: 44px`, page-ground background,
`padding: 1.5rem`. Each carries the project number at heading scale, the
client's real name, material, size in feet, and photographs.

### 5.6 Magnetic pull

Exactly two elements: the WhatsApp button and the featured board. Translate
toward the cursor by `delta / 3`, active within 140px of the edge.
`transition: transform .3s ease-out` entering, `.6s ease-in-out` leaving,
`will-change: transform`. Disabled under `(hover: none)`. Nowhere else —
the effect dies the moment it is everywhere.

### 5.7 Grain

One fractal-noise SVG data URI as a fixed full-page overlay: `opacity:.35`,
`background-size:190px`, `pointer-events:none`, above all content. It costs
nothing and is most of the difference between "flat render" and
"photographed".

## 6. Art direction

Dark. Signage photographs best on dark, and an LED glow needs darkness to
read.

- Ground around `#080C0E`, surfaces one step up, generous negative space.
- One accent, taken from his logo, in a single CSS variable so it changes in one place. Until the logo SVG exists use `#7FE3FF` and note it in `DECISIONS.md`.

  > **Resolved** — the real logo now exists (`public/logo/mark.png`).
  > `--color-accent` is `#c9a35a`, a gold sampled from the logo's icon
  > mark. See `DECISIONS.md`.
- Photographs supply all other colour. No gradient meshes, no glassmorphism, no purple-to-blue hero.
- Text over imagery always sits on a scrim dark enough for 4.5:1. Measure it.

### 6.1 Type system

Defaults, to be swapped for whatever the logo dictates — but never left to
chance.

- Display — Archivo, width axis 115–125, weight 700–800. Wide grotesque; the lettering of actual signage. Headlines only.
- Body — Source Sans 3, 400/600. Do not use Inter.
- Utility — IBM Plex Mono, 400/500, `font-variant-numeric: tabular-nums`. Reserved for what a trade buyer scans: sizes in feet, material names, prices, years. This register makes the site read as a shop that measures things.
- Scale ratio 1.25 mobile, 1.333 desktop, via `clamp()`. Set once as tokens; never write a one-off font size.
- Body near 65 characters wide. Headlines `text-wrap: balance`. Uppercase labels `0.12em` tracking, nothing else.
- 8px spacing base. Section rhythm 96px mobile, 128px desktop, applied consistently — inconsistent vertical rhythm is the clearest tell of an unfinished site.

### 6.2 Motion discipline

One reveal pattern site-wide (§5.3). Project images scale 1.03 on hover
over 500ms. At most one parallax element per section. Everything disabled
under `prefers-reduced-motion`. If you find yourself installing a library
for below-the-fold motion, stop and ask.

## 7. Page structure

- **Hero** — §5.1 and §5.2. Over it: `<h1>`, one line of copy, two buttons (WhatsApp, See work) as real DOM.
- **Work** — the stacking cards of §5.5, filterable by material: signage · flex · acrylic/LED · wedding · print · digital.
- **Kya banate hain** — services with real materials and honest price ranges. Name things, not "solutions".
- **Materials** — the marquees of §5.4.
- **Wedding cards** — a card that folds open on scroll. Warm, paper, gold foil; a deliberately different mood. Build last.
- **Process** — Design → Approval → Print → Installation, with the promise that dates are kept.
- **Digital** — websites and apps, so a branding client learns he does this too.
- **Quote request** — size in feet, material, optional photo of the wall, name, phone. POSTs to a Pages Function; leave a clear seam for the ops app to consume these later.
- **Floating WhatsApp button** — persistent, bottom-right, pre-filled `wa.me` message. In this market it out-converts a form several times over. Never omit it.
- **Footer** — address, map, hours, phone. Local SEO lives here.

## 8. The scroll sequence

### 8.1 Scroll architecture

One normalised value, `heroProgress`, 0 → 1, over 300vh of scroll, not
more. Native scroll drives it; never intercept the wheel. A hard flick
should shoot straight past — that is correct.

A single Lenis listener writes `heroProgress` into the zustand store,
throttled to `requestAnimationFrame`. Never `setState` per frame. No React
re-render may be caused by scrolling.

### 8.2 The frames

| heroProgress | Beat |
|---|---|
| 0.00 → 0.15 | Flat artwork; CMYK plates register into one image |
| 0.15 → 0.40 | Material arrives — letters extrude, board gains thickness, slow orbit reveals the edge |
| 0.40 → 0.60 | LED on; the world darkens as the sign takes over |
| 0.60 → 0.80 | Board rotates and mounts on the wall; blue-hour light, one soft contact shadow |
| 0.80 → 1.00 | Camera pulls back; the board becomes one tile in a wall of real work |

Beat 5 must hand off into the Work section — the sequence delivers the
visitor somewhere rather than stopping.

Pipeline: animate the five beats in Blender over 72 frames (120 on
desktop, §10). Render 1500 × 1125, WebP q80, ≤ 18 KB/frame. Name
`hero_0001.webp` … in `public/media/hero-seq/`. Preload frames 1–8 eagerly
(frame 1 is also the poster image), 9–40 on `requestIdleCallback`, the rest
after. Draw to a `<canvas>` with `drawImage`; skip the draw when
`Math.round(progress * (n-1))` hasn't changed.

### 8.3 Optional live 3D

Only after §8.2 ships, and only for tier A. Dynamically imported so three
never touches the main bundle. Geometry is deliberately simple — a box,
the logo SVG extruded at runtime with `ExtrudeGeometry`, a wall plane.
Realism comes from a 1k blue-hour HDRI and one directional key light at
`[3, 4, 2]`, not polygon count. `<Canvas frameloop="never">` with manual
`advance()` on progress change; stop advancing when the canvas leaves the
viewport or the tab is hidden.

Then judge it honestly. Put the live scene and the pre-rendered frames
side by side on a real phone. If the live scene is merely equivalent,
delete it — it is pure cost. Say which it is; do not keep it because it
was hard to build.

## 9. Tier system

```ts
export type Tier = 'A' | 'B' | 'C'
```

Detect in under 200ms, before the hero paints.

**Return `'C'` if any of:** no WebGL2 context; `prefers-reduced-motion:
reduce`; `navigator.connection?.saveData`; `effectiveType` in `slow-2g` |
`2g` | `3g`; `deviceMemory <= 2`; `hardwareConcurrency <= 4`.

**Return `'A'`** if `deviceMemory >= 8` and `hardwareConcurrency >= 8` and
`(pointer: fine)`. **Otherwise `'B'`.** Treat missing APIs (Safari has no
`deviceMemory`) as mid-range — guessing high is how you cook someone's
phone.

> **Amended from the original draft**, which put the `deviceMemory` floor
> at `<= 4`. Chrome's Device Memory API rounds actual RAM down to the
> nearest power of two and caps at 8, so `4` is a bucket containing every
> 4–7GB phone — most of the target audience in §1. Gating tier C on that
> value routed most real phones to the reduced experience by default. See
> `DECISIONS.md` for the live repro that caught this.

Then measure. Sample 60 frames, take the median (one GC pause shouldn't
demote a good device). Median FPS `< 40` on tier A → B. `< 25` on tier B →
C. Downgrades are one-way; never upgrade mid-session or the tier flaps
visibly.

> **Amended from the original draft**, which sampled 90 frames and demoted
> tier A below 45fps. The frame sequence (§8.2) now ships to every tier
> regardless of the measured result — the threshold only decides frame
> count and whether the optional live scene (§8.3) loads — so the probe
> leans toward trusting measured frame time over a stricter static guess.

Tier C gets the scrub sequence at reduced frame count.
`prefers-reduced-motion` is a special case: a single static hero, no
scrubbing — honour the preference properly rather than serving a gentler
animation.

Add a `?tier=A|B|C` override in development. You will use it daily.

## 10. Performance budget

These are not a quality ceiling. Nothing that makes this site beautiful is
measured in kilobytes — the HDRI, the material tuning, the easing curves,
the type scale and the photography decide how it looks, and they cost
nothing extra.

The two numbers that never move: first meaningful paint on 4G < 1.5s, LCP
on simulated 4G < 2.5s. Budget bytes to serve these. If a richer asset
still hits them, ship it.

| Asset | Mobile (B / C) | Desktop (A) |
|---|---|---|
| Main bundle JS | 150 KB gz — hard fail | 180 KB gz |
| Optional 3D chunk, lazy | 2.5 MB | 5 MB |
| Textures | ≤ 1024 px | ≤ 2048 px |
| Frame sequence | 72 frames, ≤ 1.4 MB | 120 frames, ≤ 3 MB |
| Hero photograph | ≤ 180 KB AVIF | ≤ 300 KB AVIF |
| Gallery photograph | ≤ 120 KB | ≤ 200 KB |
| Total first view | ≤ 3 MB | ≤ 6 MB |

The desktop surplus goes to exactly three things, in order: more frames in
the scrub sequence (120 is perceptibly smoother than 72), 2048px normal and
roughness maps on the acrylic, larger photographs. Not libraries.

Before asking to raise a limit, take it from somewhere cheaper: AVIF over
WebP over JPEG (30–50% free); responsive `srcset` (never send 1600px to a
390px screen); lazy-load below the fold (the budget is per view); preload
only what beat 1 needs; delete a dependency. Third-party scripts — chat
widgets, tracking pixels, eagerly-loaded maps — are the usual reason a site
blows its budget while looking no better. Add none without asking.

`npm run check:budget` fails the build over the limit. A budget nobody
measures is a wish.

## 11. Assets

### 11.1 Use freely

| Need | Source | Licence |
|---|---|---|
| HDRIs for Blender | Poly Haven | CC0 |
| PBR materials | ambientCG | CC0 |
| Walls, streets, dusk ambience | Unsplash, Pexels | Free commercial — verify per asset |

Log every downloaded asset with source and licence in
`public/media/CREDITS.md`.

### 11.2 Never stock

- **The portfolio.** Another shop's signboard presented as this shop's work misleads a customer into buying on work that wasn't done. Labelled placeholder until the real photograph exists — placeholders ship as placeholders, or the section doesn't ship.
- **Named clients, testimonials, review counts, project years.** Leave empty and flag. Never invent one to fill a layout.
- **The workshop and the owner's portrait.** A stranger's print shop is a claim about premises.

### 11.3 The day/night pair — render it

No library holds two frames of the same shopfront, same tripod, day and
night. Build the scene once in Blender and render it twice from an
identical camera: daylight, then blue hour with the emissive on. Honest as
a visualisation, available today, and it swaps for real photographs later.

> **Superseded for this build** — Shahid is shooting this pair himself:
> two real photographs of the real shopfront, phone locked in a single
> position, once in daylight and once after dark with the sign lit. Real
> photography beats any render. See `DECISIONS.md` for the exact
> dimensions/framing brief and delivery status.

### 11.4 Placeholders

Missing images render as a solid block in the accent colour with the
expected filename across it in mono type. Never stock photography — a
placeholder must be obviously a placeholder. Document every expected
filename and aspect ratio in `public/media/README.md`.

### 11.5 The shoot brief, for `public/media/README.md`

1. 15–20 installed boards, three frames each: wide with the shopfront, straight-on, close detail of edge and finish.
2. Five LED or glow signs at blue hour — the twenty minutes after sunset. The hero images of the site.
3. The day/night pair: one shopfront, tripod unmoved, daylight and after dark with the sign lit.
4. Wedding cards: flat lay on textured paper, one angled shallow-DOF, one open showing inserts.
5. The workshop: printer running, vinyl being weeded, hands applying.
6. Ten seconds of video of the print head crossing, for a silent loop.
7. One portrait of Shahid.
8. Material close-ups — ACP, acrylic edge, star-flex weave, 300 GSM. A phone and daylight beat any stock texture; these are the actual materials being sold.

## 12. Content and copy

All copy lives in `content/site.ts`, typed (`Project`, `Service`,
`ProcessStep`), server-rendered. No headline may live inside a canvas.

- Name materials plainly — ACP, star flex, 3M vinyl, cast acrylic, 300 GSM. Specificity is how a trade buyer judges competence.
- Sizes in feet. Prices as honest ranges, never "contact us for pricing" — vagueness reads as expensive.
- Real client names and locations under real photographs. One named shop beats ten stock logos.
- Exactly three trust numbers, stated once: years in business, boards installed, cities covered.
- English headlines; Hinglish where it should feel warm.

  > **Superseded** — Shahid reads English fluently and asked for
  > professional English copy throughout, no Hinglish. All headlines
  > (hero, Work, Services, Wedding) are now English. See `DECISIONS.md`.
- No "solutions", no "we provide", no "one-stop".

## 13. SEO, accessibility, conversion

- Every word is real DOM text, server-rendered. A shop that lives on local search cannot afford Google seeing an empty page.
- Metadata API for title/description/OG; use the mounted-and-glowing render as the OG image.
- JSON-LD `LocalBusiness` — name, address, geo, openingHours, priceRange, telephone, sameAs for Google Business Profile and Instagram.
- Leave `/[city]/[service]` route structure open. Do not build those now.
- Canvas `aria-hidden`. Skip link. Visible focus rings. Keyboard-reachable quote form with real labels, not placeholder-only fields.
- The loading screen is part of the show: registration marks converging, a percentage in mono, gone in under two seconds. A white screen with a spinner undoes everything the next scroll earns.

## 14. Gotchas

- Never `setState` inside a scroll or `useFrame` handler. Mutate refs.
- Do not place a `<Canvas>` inside a parent with a CSS filter or transform — it breaks compositing on Safari.
- Use `dvh`, not `vh`, for full-height anything. iOS address-bar resizing shifts the whole sequence otherwise.
- Dispose geometries, materials and textures on unmount.
- Keep GSAP out of the main bundle — tier C scrubbing needs arithmetic, not a timeline.
- Test on a real mid-range Android over mobile data before declaring anything done. A throttled desktop is not the same thing.

## 15. How to work

Do not write code yet. Reply first with: your reading of §3 and §5 in your
own words, a list of everything in the current build that now contradicts
this spec, anything here you think is wrong, and your proposed order of
work. You have the whole picture — argue now, not at the end.

Then work in these steps, stopping after each to tell me what to open and
click:

- **R1** — §5.1, §5.2, §5.7. The mask reveal, the type scale, the grain. These three together change the entire feel. Stop and show screenshots at 390px and 1440px.
- **R2** — §5.3, §5.5, §5.4, §5.6, in that order.
- **R3** — Hosting and images: static export to Cloudflare Pages, sharp pipeline replacing next/image, budget check green.
- **R4** — §8.2 pre-rendered sequence as the shipping hero; §11.3 rendered day/night pair swapped in.
- **R5** — §8.3 judgement on live 3D: keep or delete, with your honest verdict.
- **R6** — Performance pass against §10 on a real device; §13 audit.
- **R7** — Wedding-card fold, only if R6 is comfortably inside budget.

### 15.1 The quality bar

This site is the shopfront of a business that sells design. If it looks
like a competent template it has failed, however well it scores.

- Do not accept your own first visual pass. When a section works, look again, name three things weaker than they should be, and fix them before calling it done.
- Screenshot every section at 390px and 1440px and look at both.
- If a render reads as a grey box with letters on it, the fault is lighting and material — no scroll animation rescues it. Fix the render.
- If a decision here is making the result worse, say so and argue for the alternative.

Commit at each step. Keep `DECISIONS.md` current with anything you chose
that this spec didn't dictate.

## 16. Acceptance checklist

- [ ] On a mid-range Android over 4G, something meaningful is on screen in under 1.5s.
- [ ] The day/night reveal works with a cursor on desktop and animates on its own on touch.
- [ ] `prefers-reduced-motion: reduce` gives a static hero, not a gentler animation.
- [ ] Scrolling fast flicks straight past the hero with no resistance.
- [ ] Parking the page past the hero produces zero WebGL draw calls.
- [ ] View-source shows every headline, service name and price as text.
- [ ] The WhatsApp button is reachable from every scroll position on mobile.
- [ ] No stock photograph appears anywhere a real client's work is implied.
- [ ] Lighthouse on throttled 4G: performance ≥ 85, accessibility ≥ 95.
- [ ] Changing the accent colour requires editing exactly one line.

## 17. Outside the code — surface these at R6

- Google Business Profile claimed, with this photography, correct hours and service area. It outranks the website for most searches that matter.
- Review loop — the ops app requests a review the evening of delivery; point it at that profile and surface the reviews here.
- City and service pages as real indexable HTML, once the main site is live.
- Long immutable `Cache-Control` on `public/media/hero-seq/`.
- One editorial rule for every future effect: does it show something about his work that a photograph cannot? If no, cut it. Three earned moments beat twelve decorative ones.
