# Decisions

Running log of choices the spec didn't dictate, and why. Newest at bottom.

## M0

- **Project directory name.** `create-next-app` refuses capital letters in a
  package name. Scaffolded into a temp lowercase folder and confirmed
  Windows' case-insensitive filesystem treats it as the same directory as
  `TheInfinityArt` — no actual file move was needed. `package.json` name is
  `theinfinityart`, lowercase; the folder on disk keeps its original casing.
- **Tailwind v4, no `tailwind.config.ts`.** v4 is CSS-first — the "small
  token layer in CSS variables" the stack calls for and Tailwind's own config
  mechanism are the same file (`app/globals.css`, `@theme` block). Not adding
  a parallel config file to avoid two sources of truth for the same tokens.
- **Accent colour placeholder.** `--color-accent: #7fe3ff` in
  `app/globals.css`, one line, per spec §10. Swap it there once Shahid's logo
  exists and pull the real accent from it.
- **Archivo width axis.** Loaded via `next/font/google` with `axes: ["wdth"]`
  rather than restricting `weight`, specifically to keep the variable width
  axis (115–125) usable via `font-stretch`. Weight is fixed at 800 in the
  `h1–h4` base style for now; fine-tuning the exact stretch/weight pairing
  for real headlines happens in M1 when actual headline copy and sizes are
  in front of us.
- **Type scale.** Fluid `clamp()` steps (`--step--1` … `--step-5`) computed
  for a 1.25 ratio at a 375px viewport and a 1.333 ratio at a 1440px
  viewport, base 16px. Exposed to Tailwind as `text-step-*` utilities via
  `@theme`.
- **Spacing rhythm.** Using Tailwind's default 4px-based spacing scale (not a
  custom 8px scale) and simply sticking to even-numbered steps everywhere,
  which nets out to an 8px grid without inventing a parallel scale. Section
  rhythm (96px → 128px) is its own token, `--spacing-section`, exposed as the
  `py-section` utility so it's applied identically everywhere instead of
  copy-pasted `py-24 md:py-32`.
- **JS budget is already tight at M0.** `npm run check:budget` reports
  **130.3 KB gzipped** for `/` with nothing but Next 16 + React 19 + three
  fonts + Tailwind — before Lenis, GSAP or zustand are added in M3, all of
  which count toward the same "JS before 3D loads" budget in §11. Only
  ~20 KB of headroom remains. Worth watching closely at M3; may need to trim
  a font weight or reconsider bundling if it goes over.
- **`app/page.tsx` at M0 is a scaffold smoke test, not the homepage.** It
  exists to prove fonts, tokens, `content/site.ts`, and the placeholder
  system all work together end to end, and to have something to point a
  Vercel preview at. It gets fully replaced starting at M1 (Work section
  vertical slice).

### Content placeholders — flagged for the client, not just for me

- **`business` contact info** (`content/site.ts`) — phone, WhatsApp number,
  full address, geo coordinates, and hours are bracketed placeholders
  (`[City]`, `+91 90000 00000`, etc.). These are load-bearing: the WhatsApp
  button and the LocalBusiness JSON-LD are both wired to these fields. **Must
  be replaced with Shahid's real details before any production deploy** —
  this is a hard gate at M2, not a nice-to-have.
- **`projects`** — every client name, location and photo filename in
  `content/site.ts` is a fictional sample entry (e.g. "Shree Umiya Traders").
  They exist so the Work grid has realistic-looking data to lay out and
  review against at full fidelity (M1), not to ship. Real client names,
  locations and photography replace them at M2, per the shoot brief in
  `public/media/README.md`.
- **`services` price ranges** — illustrative, market-plausible figures for
  the Surat/Gujarat signage and print trade, not Shahid's actual pricing.
  Named materials are real category names (ACP, star flex, cast acrylic,
  300 GSM, etc.) per the copy rules; only the numbers need his confirmation
  before M2.
- **`trust` numbers** (years in business, boards installed, cities covered)
  — placeholders (`[X]+`) pending real figures from Shahid. Deliberately
  left bracketed rather than guessed, since a specific-looking wrong number
  is worse than an obvious placeholder.

- **First Vercel deploy via file upload, not a git-linked project.** No
  GitHub remote exists yet, so this used `deploy_to_vercel` (direct file
  upload) rather than `create_git_project`. `package-lock.json` and the
  default scaffold assets (`AGENTS.md`, `CLAUDE.md`, root `README.md`,
  unused default SVGs, `favicon.ico`) were left out of that upload since
  they don't affect the build — Vercel ran a fresh `npm install`. Once this
  repo has a GitHub remote, switch to a git-linked project so every push
  deploys automatically and the lockfile is respected. Live at
  https://theinfinityart.vercel.app.

- **Two live Vercel deployments exist for a while.** `theinfinityart.vercel.app`
  (manual file-upload deploy, `qalbi1` team) is the one I can inspect and
  redeploy directly. `the-infinity-art-by-shahid.vercel.app` (git-linked,
  Shahid's own Vercel account, repo
  `GenerativeZee/TheInfinityArt_by_Shahid`) is the one we're standardising
  on going forward, per Shahid's request. Its builds succeed cleanly from
  git pushes, but the production domain intermittently served
  `DEPLOYMENT_NOT_FOUND` despite showing "Valid Configuration" — being
  chased down as a Vercel-side alias issue, not a code issue.

## M1 — Work section vertical slice

- **Display font restricted to h1/h2, not h1–h4.** §10.1 says the wide
  Archivo treatment is for "headlines only." Applying it through h4 (as M0
  did) made small card titles (e.g. project names in the Work grid) render
  in heavy, stretched display type where a normal semibold body-font title
  reads correctly. h3/h4 now inherit the body font by default; anything
  that's genuinely a section headline still gets `<h2>` and the display
  treatment.
- **Reveal-on-scroll implemented as a DOM mutation, not React state.**
  `components/ui/Reveal.tsx` toggles visibility classes directly via
  `ref.current.classList.add(...)` inside its `IntersectionObserver`
  callback rather than `useState`. The state-based version tripped the
  `react-hooks/set-state-in-effect` lint rule for the
  `prefers-reduced-motion` early-return path (synchronous `setState` in an
  effect) — and the DOM-mutation version is arguably more correct anyway,
  since this is a one-time, non-reactive change driven by an external
  system (viewport intersection), which is exactly what effects are for
  per that rule's own guidance. No other component needs this pattern yet;
  revisit if it does.
- **Filter is client-side, over the full dataset, no separate "hide via
  CSS" trick.** The Work grid is a small "use client" component that
  receives all projects as props and filters the array in render. Next
  still server-renders the initial ("All") state as real DOM text, which
  is what search engines and no-JS clients get — satisfies §12 without
  needing to keep filtered-out cards in the DOM.
- **Ken-burns and hover-zoom are plain CSS, gated by a
  `prefers-reduced-motion: no-preference` media query** (`.hover-zoom`,
  `.kenburns-slow` in `app/globals.css`), not Tailwind's `motion-safe:`
  variant repeated on every utility — same effect, less repetition.

## M1b — remaining sections, static hero, quote form, JSON-LD, metadata

- **Quote form doesn't upload the photo field.** No storage is provisioned
  (no Vercel Blob, no DB) and the spec's own framing ("for now, store and
  forward to WhatsApp") suggested an MVP seam rather than a full pipeline.
  The optional photo `<input>` is real and accessible, but selecting a file
  only flags `hasPhoto: true` in the payload — the visible copy under the
  field tells the user the photo isn't uploaded and to share it on
  WhatsApp instead. **Before this matters for real leads**, wire actual
  file storage (Vercel Blob is the natural fit) rather than shipping this
  as-is.
- **`/api/quote` "stores" a submission by logging it**, then returns a
  prefilled `wa.me` URL the client redirects to. No database is
  provisioned — this is the seam the spec asked for (§9), not the final
  version. Swap the `console.log` for a real write once there's an ops app
  to consume it.
- **`SITE_URL` in `app/layout.tsx` is hardcoded to
  `theinfinityart.vercel.app`** for `metadataBase`, Open Graph, and the
  JSON-LD `url` field. Needs updating the moment a real production domain
  is chosen.
- **No Open Graph / JSON-LD image yet.** §12 specifies the beat-4 (mounted,
  glowing) hero render as the OG image — that doesn't exist until M4/M5
  produce it. Both are left without an image rather than pointing at a
  placeholder that would look broken when scraped by a social platform.
- **Materials marquee is now the real thing** — pure CSS `@keyframes`
  translateX loop, list duplicated once for a seamless wrap, gated by
  `prefers-reduced-motion: no-preference` (`components/ui/Marquee.tsx` +
  `app/globals.css`). M0's version was a static, non-scrolling row.
- **Hero is a static placeholder**, per M1b scope — `Placeholder` block as
  the background layer (standing in for `hero_0001.webp`, §8) with a
  gradient scrim for 4.5:1 text contrast (§10). The scroll-driven 3D
  sequence replaces only that background layer at M3–M5; the DOM copy and
  CTAs don't change.

## M3-M5 — live scene, tier system, scroll/GSAP wiring

- **No real logo yet, so the letters mesh is a placeholder infinity mark** —
  two `TorusGeometry` rings, not `ExtrudeGeometry` from an SVG (§7). Building
  a hand-rolled Bezier lemniscate `THREE.Shape` (the original plan) turned
  out fragile without a visual iteration loop, and torus rings are a
  built-in primitive that's always geometrically correct. The
  extrude-from-SVG pipeline itself isn't built yet — do that once Shahid's
  real logo exists, since a placeholder path isn't worth building it against.
- **No real HDRI yet** — using drei's built-in `<Environment preset="night">`
  (hosted on drei's CDN, fetched at runtime) as a stand-in for the "1k
  blue-hour HDRI" the spec calls for. Swap for a real Poly Haven blue-hour
  HDRI when one is sourced; the swap is a one-line prop change.
- **Tier B's "baked shadow-plane texture"** is a `CanvasTexture` — a radial
  gradient drawn at runtime on an offscreen `<canvas>`
  (`components/hero/shadowTexture.ts`) — not an actual bake, since there's
  no real scene to bake from yet. Disposed on unmount.
- **`frameloop="demand"` + `invalidate()`, not `frameloop="never"` + the
  standalone `advance()` export.** These are functionally the same thing —
  demand mode renders only when `invalidate()` is called, which is R3F's
  own built-in name for exactly the pattern §4.2 describes. Went with the
  more idiomatic, better-documented API rather than the lower-level one.
  Important detail: `invalidate()` is called from a small
  `InvalidateOnProgress` component that subscribes to the heroProgress
  store — never from inside `useFrame` itself, which would self-trigger
  every frame and defeat the entire point of demand mode.
- **The FPS probe forces `frameloop="always"` for its own ~2s/90-frame
  window**, then drops to demand mode. A demand-mode canvas mostly isn't
  rendering, so sampling frame timing against it right after mount would
  measure the browser's idle refresh rate, not real render cost — forcing
  continuous rendering during the probe window is necessary for the
  measurement to mean anything, and only that window trades away the
  "zero draw calls when idle" property.
- **Two React-Compiler-era lint rules shaped the hero code** more than
  expected: `react-hooks/set-state-in-effect` (tier detection now uses
  `useSyncExternalStore` instead of `useState` + `useEffect`, which also
  correctly signals "this differs between server and client" rather than
  papering over it) and `react-hooks/immutability` (the R3F scene object
  from `useThree` gets piped through a ref before `Scene`'s `useFrame`
  mutates it — refs are exempt, direct hook-return mutation isn't). Same
  family of fix as [[reveal-dom-mutation]] in M1.
- **Lenis lerp set to 0.85** (barely any smoothing) rather than a typical
  cinematic value — a heavier lerp fights the "hard flick shoots straight
  past the hero" requirement (§6, §16). Untested against a real trackpad —
  worth revisiting at the M6 device pass.
- **JS budget is now 141.6 KB gzipped against the 150 KB cap** (zustand +
  Lenis + GSAP added ~10 KB on top of M1b's 133.2 KB). ~8 KB of headroom
  left; three/R3F/drei/postprocessing are confirmed code-split into a
  separate ~1.1 MB lazy chunk that does NOT count toward this budget
  (verified directly against `route-bundle-stats.json`, not just trusted).

## M6 — performance pass

- **Fixed a real one-line-accent-change violation (§16 acceptance check):**
  `Scene.tsx` had `#7fe3ff` hardcoded a second time for the letters'
  emissive colour, independent of `--color-accent` in `app/globals.css`.
  Added `lib/theme.ts` (`getAccentColor()`, reads the CSS variable via
  `getComputedStyle` at runtime) so the 3D scene now derives its accent
  from the same single source instead of duplicating it. Caught by
  actually re-checking the acceptance checklist against the code, not by
  assuming it was fine.
- **Confirmed, not just assumed, that three/R3F/drei/postprocessing are
  code-split out of the main bundle**: inspected
  `.next/diagnostics/route-bundle-stats.json` directly rather than trusting
  the gzip number alone — the "/" route's first-load set is 7 small chunks
  totaling 141.6 KB gzipped; the 3D libraries land in a separate ~1.08 MB
  raw / ~0.30 MB gzipped chunk that isn't in that list at all, confirming
  the `next/dynamic(..., { ssr: false })` boundary around `HeroCanvas`
  is actually doing its job. 0.30 MB is comfortably inside the 2.5 MB lazy
  payload budget (§11) — we have no Draco/meshopt/KTX2 assets to compress
  since the geometry is procedural, not loaded from files.
- **Lighthouse / real-device testing not run from this session.** No
  browser automation was available here (the Chrome extension never
  connected) and there's no headless Chrome in this environment to drive
  `lighthouse` CLI against. The architecture satisfies the *intent* of
  every §16 item that can be verified by reading code and build output
  (disposal on unmount, viewport/visibility pausing, frameloop gating, the
  one-line accent, the lazy-chunk boundary) — but the actual Lighthouse
  score, real 4G timing, and how the hero *feels* on a real mid-range
  Android have not been measured and must be checked before this milestone
  is considered done. Recommend running Lighthouse (throttled 4G, mobile)
  against the deployed preview, and testing on a real device per §15's own
  instruction ("a throttled desktop is not the same thing").

## M7 — wedding card fold

- **Built despite the JS budget being tight, not "comfortably" within it**
  (§14 gates M7 on M6 being comfortably within budget) — the deciding
  factor was that the marginal cost is near zero: `WeddingCanvas` is its
  own `next/dynamic(..., { ssr: false })` boundary reusing the exact same
  lazy three.js/R3F chunk the hero already loads, so it adds essentially
  nothing to the always-loaded main bundle (141.6 → 141.9 KB gzipped,
  confirmed via `check:budget` and `route-bundle-stats.json` — still 7
  first-load chunks, three.js isolated in the same separate lazy chunk),
  just a small amount of additional code inside the chunk that's already
  lazy. The actual gating concern — real device performance — is still
  unverified (see M6 note on no Lighthouse/device testing having run).
- **Own local scroll progress, not the global heroProgress store.** The
  fold is a separate, much shorter scroll moment scoped to its own section
  (`components/wedding/useCardProgress.ts`), not part of the hero's 300dvh
  track. Kept in a ref and read imperatively inside `useFrame`, same
  discipline as heroProgress — never React state, never a per-scroll
  re-render.
- **Simpler pause strategy than the hero's**: `frameloop="always"` while
  the card is in view, `"never"` otherwise (IntersectionObserver +
  visibilitychange), rather than the hero's demand/invalidate/probe
  machinery. Justified by scale — two planes, no environment map, no
  post-processing — building the heavier machinery for a "tiny model"
  would be over-engineering it.
- **Tier-gated via the existing global `tier` in the zustand store**
  (set once by the hero's `HeroCanvas`) rather than re-running detection.
  Tier A/B get the live fold; tier C, and every server-rendered pass
  (`tier` starts `null`), get the same static image used everywhere else
  (`SiteImage`, see [[sample-content-pass]]) — no separate fallback path
  to maintain.
- **Two bugs fixed on review before commit.** `WeddingScene`'s accent lookup
  used `useRef(getAccentColor()).current` as a "lazy ref init" — tripped the
  React Compiler-era `react-hooks/refs` lint rule (reading `.current` during
  render), same family as [[reveal-dom-mutation]]; switched to
  `useMemo(() => getAccentColor(), [])`, matching the hero's `Scene.tsx`
  pattern exactly. Separately, `WeddingCanvas`'s pause logic derived `active`
  from a single state variable updated by two independent listeners
  (`prev && !document.hidden` in the visibilitychange handler) — once the
  tab was hidden while the card was in view, tabbing back never resumed
  rendering because `prev` was already `false`. Fixed by tracking
  `intersecting` and `hidden` as separate state and deriving
  `active = intersecting && !hidden`.

## Sample content pass

- **Business contact info and trust numbers filled with plausible sample
  values**, not left as literal `[X]` brackets. Phone/WhatsApp is a fake
  but correctly-formatted Indian mobile number; the address is a
  plausible Surat street address; `geo` points at Surat's actual
  coordinates (21.1959, 72.8302) since a wrong-city pin would be worse
  than an approximate real one. **Still placeholder, still gated** — the
  hard requirement in the M0 "content placeholders" note (real details
  before any production deploy) is unchanged; this pass only makes the
  demo/review experience not show broken-looking bracket text.
- **`work/*` and `wedding/hero-flatlay.jpg` are now real files** — free
  Unsplash stock photos (see `public/media/ATTRIBUTION.md` for the exact
  source of each), not the accent-block `Placeholder`. Chosen to be
  generic-enough category photos (a signboard, a glowing shop sign, a
  business-card mockup, a wedding flat lay) that don't misrepresent any
  specific real business, and screened to exclude Unsplash+ (paid)
  results — everything used is under the free Unsplash License. This is
  still sample content standing in for the real shoot in
  `public/media/README.md`, same as the fictional project data itself;
  it just no longer *looks* unfinished while doing so.
- **New `components/ui/SiteImage.tsx`, not a fallback branch inside
  `Placeholder`.** Renders whatever file is on disk via `next/image` —
  swapping a stock JPEG for real client photography later is just
  overwriting the file at the same path, no code change. `Placeholder`
  itself is untouched and still used by the hero's tier-C/no-JS fallback
  (`components/hero/HeroStage.tsx`), since the 72-frame `hero-seq/`
  scrubbed sequence is a much larger asset job intentionally out of scope
  for this pass.
- **JS budget moved from 141.9 to 147.4 KB gzipped** (still under the
  150 KB cap, ~2.6 KB headroom left) — this is `next/image`'s runtime
  code entering the main bundle for the first time, not the photos
  themselves (image bytes are static assets, not JS). Worth watching:
  there's very little headroom left for anything else that touches the
  always-loaded bundle.
- **The live wedding fold's cover face now textures with the same sample
  photo**, not just plain paper — a first look at the section showed a
  plain beige rectangle (the procedural card closed, no artwork), which
  read as broken/unfinished rather than "intentional placeholder."
  `WeddingScene.tsx` loads `/media/wedding/hero-flatlay.jpg` via a plain
  `THREE.TextureLoader` in a `useEffect` (not drei's `useTexture`, to
  avoid adding a Suspense boundary for one texture) and disposes it on
  unmount/replacement. The cover panel is now two single-sided planes —
  front (`FrontSide`, textured) and back (`BackSide`, plain paper) at a
  hairline z offset — instead of one `DoubleSide` plane, so the outside
  of the closed card shows the photo and the inside (revealed on open)
  stays blank paper, like a real card. The photo is 4:3 but the cover
  plane is 3:4 portrait, so the texture is center-cropped via UV
  repeat/offset (object-fit: cover equivalent) rather than stretched.

## Tier detection was silently downgrading most real phones

- **`deviceMemory <= 4` / `hardwareConcurrency <= 4` in `lib/tier.ts`
  loosened to `<= 2`.** Confirmed live on a real phone: it sat on the
  tier-C static fallback (no hero animation, no wedding fold) by default,
  then ran the full tier-B live scene without issue once forced via
  `?tier=B`. Root cause — Chrome's Device Memory API rounds actual RAM
  down to the nearest power of two, so most contemporary phones with
  4-6GB actual RAM report exactly `4`; the old `<=4` floor was reading
  that as "definitely low-end" and routing the majority of real phones
  to the static fallback instead of the live scene they can handle.
  Lowered the floor to `<=2` for both signals so only genuinely low-end
  hardware pre-emptively lands on C — the existing live FPS probe
  (§5.2, `probeFps`/`downgradeFor`) is the actual safety net for a wrong
  guess, catching anything that turns out too slow after mount, so the
  static check no longer needs to double as that safety net itself.
- **No original brief/spec document is checked into this repo** — §-numbered
  references throughout `lib/tier.ts` and the hero/wedding components point
  at a document that only existed as context in earlier sessions. This fix
  was made on the strength of a live repro plus the internal consistency
  argument above (the FPS probe already exists to correct static-guess
  errors), not by checking against original spec numbers — flagging this
  so a future session doesn't assume `<=4` was an arbitrary guess if it
  ever needs to reconcile against the real brief.

## Spec revision — `redesign` branch

Everything above this line was built against an informal brief that only
ever existed as conversational context in earlier sessions — never checked
into the repo, referenced only by bare `§` numbers in comments. The client
sent a full rewritten spec and it's now checked in at `SPEC.md`, which is
the single governing document going forward. Work continues on a new
`redesign` branch off `master` (the M0–M7 build stays intact on `master`
as a checkpoint). `SPEC.md` explicitly supersedes prior planning, per its
own opening line.

- **Tier thresholds (§9), corrected version.** This supersedes the
  "Tier detection was silently downgrading most real phones" entry just
  above — that entry's fix set *both* `deviceMemory` and
  `hardwareConcurrency` to `<=2`; the client's read on the same evidence
  keeps `hardwareConcurrency` at the original `<=4` and only lowers
  `deviceMemory` to `<=2`. Final rule, live in `lib/tier.ts` and
  `SPEC.md` §9: tier C if no WebGL2, `prefers-reduced-motion`, `saveData`,
  slow-2g/2g/3g, `deviceMemory <= 2`, or `hardwareConcurrency <= 4`. The
  live FPS probe also changed: 60-frame sample (was 90), demote tier A
  below **40fps** (was 45), tier B below 25fps (unchanged). Rationale is
  the same live repro as before (a phone reporting `deviceMemory === 4` —
  the common case, since Chrome rounds actual RAM down to the nearest
  power of two — ran the full tier-B scene fine once forced past the
  gate) plus the client's own point: the frame sequence (§8.2) now ships
  to *every* tier regardless, so the threshold only decides frame count
  and whether the optional live scene loads — it matters less than it
  did, so it isn't worth over-tuning further.
- **Day/night hero pair (§11.3): real photography, not a render.** Shahid
  is shooting it himself — phone locked in one position, one daylight
  frame and one after-dark frame with the sign lit, ~2 hours of his time.
  Exact framing/dimensions/filenames are specified in
  `public/media/README.md` ("Day/night pair delivery"): landscape,
  16:9 preferred, camera position must not move between the two shots
  (the §5.1 mask reveal needs pixel-aligned frames), delivered as
  `hero-day.jpg` / `hero-night.jpg` in a new `public/media/hero/`
  directory. R1 builds against a labelled placeholder at that aspect
  ratio; files are needed before R4, not R1.
- **Board fabrication sequence (§8.2): baked from the existing R3F scene,
  not Blender, and explicitly not shipping quality.** No Blender (or any
  offline 3D renderer) is available in this environment. Rather than
  block the whole pre-rendered-frames architecture on that gap, frames
  get baked out of the hero's existing R3F scene (`components/hero/
  Scene.tsx`) — same "pre-rendered, not live" architecture the spec
  actually cares about, different tool than the one named. This buys a
  real, testable pipeline (naming convention, preload batching, canvas
  draw-and-skip, `sharp` compression) at R4, but the frames themselves
  are placeholder-quality scaffolding — baking a realtime scene gets the
  *performance* characteristics right, not the *quality* the whole
  revision is for. They get replaced by a proper offline Blender render
  before launch; this is logged now so a future session doesn't mistake
  the R4 frames for shipping assets.
- **Existing R3F hero/tier code: kept, re-scoped, not deleted.** It
  becomes the candidate implementation for §8.3's optional tier-A live-3D
  layer, judged honestly (keep or delete) at R5 — not the default hero
  it was built as. The wedding-card fold (M7) is left untouched
  mechanically; `SPEC.md` doesn't specify fold mechanics, so rule 2
  applies (don't invent a reason to change working code the spec is
  silent on).
- **R0 — everything fabricated came back out**, per §11.2/§12 and rule 2
  ("ask, don't invent"). All from the "sample content pass" and wedding
  cover-texture entries above:
  - `content/site.ts` — business phone/WhatsApp/address/geo back to
    bracketed/placeholder values; the three trust numbers back to `[X]`.
  - Every `projects[]` entry — `client`, `location` and `year` back to
    bracketed placeholders (`Project.year` changed type from `number` to
    `string` to hold `"[Year pending]"`). `name` and `material` stay
    descriptive (e.g. "ACP Shopfront Board") since naming a *category* of
    work isn't a claim about a specific business, only `client`/
    `location`/`year` are. Slugs and image filenames that encoded the
    fictional client names (e.g. `umiya-traders-acp-wide.jpg`) were
    renamed to neutral, category-based names (e.g.
    `acp-shopfront-board-wide.jpg`) — the old names would have leaked a
    fake business name into the visible placeholder text itself.
  - Deleted the 9 downloaded Unsplash stock photos
    (`public/media/work/*.jpg`, `public/media/wedding/hero-flatlay.jpg`)
    and `public/media/ATTRIBUTION.md`. `WorkGrid.tsx` and `Wedding.tsx`
    revert to rendering `Placeholder` again.
  - `WeddingScene.tsx`'s cover panel reverts to plain paper on both
    faces — the texture-loading code from the "sample content pass" is
    removed entirely. The fold's rotation/hinge mechanics are untouched.
  - Deleted `components/ui/SiteImage.tsx` (unused after the above, and
    architecturally contradicts §4.1 regardless of content — its
    `next/image`-based replacement is real work deferred to R3, not
    something to half-build now).
  - JS budget dropped back to 141.9 KB gzipped (from 147.4) now that
    `next/image`'s runtime is gone again.

## R1 — day/night reveal, architectural type, grain

- **`--x`/`--y`/`--r` are registered via `@property`** (`app/globals.css`),
  typed as `<length-percentage>` / `<length-percentage>` / `<length>`.
  An untyped custom property can't be interpolated by a CSS `@keyframes`
  animation — without this, the touch auto-sweep (§5.1) would jump between
  keyframe values instead of animating smoothly. `inherits: false` since
  values are always set directly on the element that reads them, never
  meant to cascade to descendants.
- **`--reveal-radius` is a plain responsive custom property (media
  queries only), not JS-computed.** Desktop interaction sets `--r` once
  via `night.style.setProperty("--r", "var(--reveal-radius)")` — a live
  `var()` reference, not a resolved pixel snapshot — so a viewport resize
  crossing a breakpoint updates the radius correctly with no resize
  listener needed.
- **Touch sweep path is percentage-based (`--x: 15% → 85%`), desktop
  tracking is pixel-based (`clientX - rect.left`).** `<length-percentage>`
  typing supports both in the same property. Percentages scale naturally
  with the panel's own width, so the sweep endpoints are always "just
  inside the sign" regardless of panel size, without measuring anything.
- **A bespoke placeholder for the two hero layers, not
  `components/ui/Placeholder.tsx`.** That component hard-codes a fixed
  aspect ratio, which doesn't fit a layer that must fill an arbitrary
  hero panel height. `DayNightReveal.tsx` inlines the same "obviously
  fake, labelled" visual language instead, tinted per layer (light
  accent tint for day, near-black for night) so the day/night distinction
  reads even before real photos exist — pure CSS, same cost as the real
  `Placeholder`.
- **The wordmark is `business.legalName`, not `hero.headline`.** §5.2
  calls it a "wordmark" (`white-space: nowrap`) — a full marketing
  sentence doesn't fit that role at 15rem, a business name does. The old
  `hero.headline` copy becomes the "one line of copy" §7 asks for,
  underneath. `hero.subhead` is no longer rendered anywhere (left in
  `content/site.ts`, unused, in case a later pass wants it back).
- **The hero photo panel is a bounded rectangle, not full-bleed, despite
  §5.1 saying `position:absolute; inset:0` for the day layer.** That
  `inset:0` is scoped to the panel's own container in this reading —
  §5.2 needs the giant wordmark visible *around* the photo for "the type
  is architecture the subject stands in front of" to mean anything; a
  full-viewport photo would just cover the wordmark entirely regardless
  of z-index. No exact panel size/position is given, so this is a
  judgment call (rule 2) rather than a spec'd value — flagging it clearly
  so it's the first thing to correct in the R1 screenshot review if it
  doesn't read right.
- **Old 300dvh scroll-jacked live-3D hero (M3-M5) retired from this
  section**, not deleted. `Hero.tsx` no longer imports `HeroStage`; that
  component tree (`HeroStage`/`HeroCanvas`/`Scene`/`useHeroProgress`) sits
  unreferenced, parked as the candidate for §8.3's optional tier-A live-3D
  layer once the real board-fabrication section (§8) exists at R4 — per
  the agreed R0 plan, not deleted outright.
- **New `--text-hero` / `--text-heading` tokens**, separate from the
  existing fluid `--step-*` scale (which tops out at ~4.7rem — nowhere
  near the 15rem/8rem §5.2 calls for). Exposed as `text-hero`/
  `text-heading` Tailwind utilities via `@theme inline`, same pattern as
  `--text-step-*`. `text-heading` also replaces `text-step-3` on every
  genuine section `<h2>` (Work, Services, Wedding, Process, Digital,
  QuoteForm) — §5.2's scale isn't hero-only, it's the whole site's
  heading scale. Left `Footer.tsx`'s `<h2>` at `text-step-2`: that
  heading is the business name label, not a section-heading moment.
- **Self-review caught two real weaknesses before calling R1 done**
  (§15.1): the eyebrow label duplicated the wordmark verbatim ("The
  Infinity Art" twice on screen) once the wordmark became the business
  name — removed, since §7 doesn't call for an eyebrow at all. And the
  bottom scrim originally covered the full hero height, which would have
  visibly darkened the photo panel sitting in its gradient zone —
  constrained to the bottom 45% where the copy actually needs it.
- **No screenshots taken — no browser tooling available in this
  environment.** The Chrome extension isn't connected (same limitation
  noted in the M6 entry) and no headless browser is installed in this
  project. `npm run dev` is running; §15's required 390px/1440px
  screenshot check needs to happen in a real browser before R1 is signed
  off, not from a code read alone.
- **The wordmark clipped off-screen mid-word in the real browser check** —
  confirmed by a client screenshot showing "THE INFIN" cut off with the
  rest invisible. Root cause is structural, not a sizing tweak: three
  words (`business.legalName`, "The Infinity Art") cannot satisfy
  `white-space: nowrap` at `clamp(3rem, 17vw, 15rem)` on any realistic
  viewport — the math doesn't work at mobile widths or desktop ones.
  Swapped the wordmark to a single `∞` glyph, which can't overflow by
  definition. The business name still renders as real text two ways: an
  `aria-label` on the `h1` itself (so the glyph doesn't cost the real
  heading text for accessibility/SEO), and a small mono label restored
  above the copy line — no longer a duplicate of the wordmark now that
  the wordmark isn't textual. This is explicitly provisional: a real
  logomark is expected once Shahid shares his logo, at which point this
  becomes an actual SVG mark instead of the Unicode `∞` character.

## Real logo received — accent colour and wordmark resolved

Shahid sent the real logo (2026-09-05): an abstract gold-gradient icon
mark above stacked "The Infinity Art" / "We Print What You Imagine" text
and a gold banner. Delivered as one flattened PNG, already with a
transparent background (no chroma-keying needed).

- **`public/logo/mark.png` — the icon only, cropped out.** No image
  tool was available (no ImageMagick, no `sharp` yet), so this used
  Python/Pillow, already present in the environment: scanned horizontal
  "ink" bands across the source PNG's alpha channel to separate the
  three visual regions (icon, text block, bottom banner) automatically,
  found the icon's tight bounding box within its band, cropped with a
  small margin, and downscaled to 1000px wide (from a 4925px source —
  the original is far higher resolution than any web use needs). See
  `public/logo/README.md`.
- **Icon-only, not the full logo file, per rule 2 and the same math as
  the wordmark fix above.** The full file's stacked text lines can't
  satisfy a single `nowrap` line at architectural scale any better than
  the business-name text could — same overflow problem, different asset.
  The client's own message explicitly offered either option ("take out
  the logo only without text, or use full logo"), so this is a decision
  within the scope they gave, not a deviation from an instruction.
- **`--color-accent` changed from the `#7FE3FF` placeholder to `#c9a35a`**
  (`app/globals.css`), resolving the placeholder SPEC.md §6 flagged.
  Sampled programmatically: averaged the RGB of every opaque pixel inside
  the cropped icon (median ≈ rgb(179,136,72); picked a point nearer the
  gradient's lighter end for better contrast against the dark ground).
  Checked WCAG contrast against `--color-ground` (#080c0e): ≈8.3:1, comfortably
  past the 4.5:1 requirement in both directions (gold text on dark, and
  dark text on a gold button background, per `bg-accent text-ground`).
  `lib/theme.ts`'s `getAccentColor()` fallback updated to match.
- **Coincidence worth recording:** the wedding fold's foil edge
  (`WeddingScene.tsx`, M7) already hardcoded `GOLD_COLOR = "#c9a35a"` —
  the exact same value this session landed on independently by sampling
  the real logo. That hardcoded constant is now deleted and the mesh
  uses `getAccentColor()` like the rest of the 3D scenes, so it updates
  automatically if the accent ever changes — closes the gap `SPEC.md`
  §16's "changing the accent colour requires editing exactly one line"
  check was pointing at.
- **The hero wordmark renders the icon as a flat CSS mask
  (`background-color: var(--color-accent)` + `mask-image:
  url(/logo/mark.png)`), not the logo's own raster gradient.** The
  client's message explicitly invited changing the logo's "theme"
  (colour). A flat, single-colour version means the wordmark
  automatically recolours with everything else if `--color-accent` ever
  changes — extending the same one-variable guarantee to the hero mark,
  not just buttons and borders. Sized by `height: var(--text-hero)` with
  `aspect-ratio: 1000/642` rather than `font-size` (it's an image, not
  text now), which also means it structurally cannot overflow the way
  the text/glyph wordmark could — no clamp math to get wrong.
- **`public/logo/full.png`** (1600px wide, the complete original with
  text and the gold banner) is kept in the repo unused for now — for the
  OG image, favicon, and footer logo work still open per §17.

## `theme-experiment-v4` branch — scroll-driven multi-theme system

Separate creative track, branched from `redesign` at `394598e`, not
governed by `SPEC.md` (which explicitly mandates one accent colour and
bans gradients/multiple palettes for the mid-range-Android performance
reasons that document lays out). Built at the client's explicit request
for a v4 experiment kept on its own branch — not intended to merge back
into `redesign` or `redesign-blue` unless asked.

- **Four dark-based themes, not one light + dark mix.** The brief's own
  examples included a light "Modern/Fresh" theme; deviated from that
  deliberately (flagged to the client before building) — this site's
  actual subject is blue-hour/LED signage photography shot for a dark
  background, and a light section would make that photography read wrong
  the moment real images land. Variation comes from hue/temperature and
  accent instead: **Nocturne** (arrival — the existing gold-on-near-black
  look, unchanged), **Verdigris** (Work/Services/Process/Digital —
  cooler, teal-tinted, "modern/structured"), **Ember** (Wedding — warm,
  brown-tinted, copper-gold accent close enough to true gold that the
  card's foil still reads as foil), **Signal** (Quote/Footer — richer
  near-black with a red-violet undertone, a muted coral-red close). Every
  accent/ground and muted-text/ground pair checked against WCAG: all
  clear 5.5:1+, most above 6.9:1 — `--color-text` itself stays constant
  across every theme so body-copy contrast is never a variable.
- **Reuses the existing scroll-progress pattern, not a new paradigm.**
  `components/theme/ThemeEngine.tsx` is architecturally identical to
  `useHeroProgress`/`useCardProgress`: one `Lenis` scroll listener,
  rAF-throttled, no React state. It walks `[data-theme-zone]` markers
  (`app/page.tsx`), finds which two zones the viewport centre sits
  between, and interpolates every colour token by that fraction directly
  into the same `--color-*` custom properties the whole site already
  reads via Tailwind's `@theme` mapping.
- **Almost no component needed to change.** Because colour already
  routed through shared CSS variables (a decision made back at M0, for
  an unrelated reason — "changing the accent requires one line"), every
  button, border, card and label re-themes for free the instant those
  variables are mutated. The only manual call: the wedding fold's 3D
  foil material reads the accent once at mount (three.js can't watch a
  CSS variable) — left as-is, since Ember's accent is gold-adjacent
  anyway and the section only needs to look right, not track live.
- **`prefers-reduced-motion` gets nearest-neighbour snapping, not no
  theming.** Per the client's own accessibility instruction: users who
  disable motion should still see the different themes per section, just
  without the continuous blend — `ThemeEngine` checks `prefersReducedMotion()`
  once and switches to picking whichever zone's midpoint is closest to
  the viewport centre, applied instantly, no interpolation math at all.
- **One restrained extra effect, not the whole brief's technique list.**
  Added a single fixed ambient glow (`components/theme/AmbientGlow.tsx`)
  — a low-opacity radial gradient tinted by the live accent variable,
  pure CSS (`color-mix()`), no JS of its own, sitting at `z-index: -1` so
  it's felt as mood rather than seen as a decoration. Deliberately
  skipped: image treatment shifts, shadow-colour changes, cursor-reactive
  effects, grain re-tinting — the brief explicitly asks for restraint
  ("use restraint... don't use all of these everywhere"), and this
  codebase's placeholder-only content (no real photography yet) makes
  most of those effects unobservable anyway.
- **JS budget moved to 142.1 KB gzipped** (from 136.0 on `redesign`) —
  the theme engine + ambient glow, still comfortably under the 150 KB
  figure `SPEC.md` sets for the *other* branch; this branch isn't held to
  that budget, but there was no reason to be wasteful either.
- **Running on `localhost:3001`** — the same dev server already serving
  `redesign` picked this branch up automatically via the filesystem the
  moment it was checked out; no separate server needed to preview it.

## Copy pass — English throughout, no Hinglish

Client feedback: Shahid is educated and reads English fluently, so the
Hinglish headlines were making the site read less professional to him,
not warmer. Supersedes `SPEC.md` §12's "English headlines; Hinglish
where it should feel warm" (noted there, not silently dropped).

- **Four headlines translated, not just deleted.** `hero.headline`
  ("Aapki dukaan, doosron se alag.") → "Your shopfront, unmistakably
  yours."; `wedding.headline` ("Aapki shaadi, aapka style.") → "Your
  wedding, your style."; the Work section's h2 ("Kahaan se banwaayi?")
  → "Our Work"; the Services nav label and eyebrow ("Kya Banate Hain")
  → "Services". Kept the same intent (a shopfront that stands apart, a
  wedding suite that's personal, work worth showing) rather than
  producing generic replacements.
- **Found and fixed a pre-existing content-architecture gap while
  touching this text.** `Work.tsx` and `Services.tsx` hardcoded their
  eyebrow/heading/body text directly in JSX — the two Hinglish phrases
  lived there, not in `content/site.ts`, unlike `wedding`/`digital`/
  `quote`, which already properly source from it. Added matching `work`
  and `servicesIntro` objects to `content/site.ts` and pointed both
  components at them, closing the "single source of copy" gap (§12's
  own stated principle) for these two sections specifically. Left
  `Process.tsx`/`Digital.tsx`'s equivalent hardcoding alone — their text
  was already English and untouched by this request; fixing it isn't
  part of what was asked, flagging it here so a future pass doesn't
  treat the inconsistency as unnoticed.

## Catalogue → interactive experience (v4, three interactions)

Client wanted the site to stop feeling like "a beautiful digital
catalogue" — scroll, read, look at cards, repeat. Explicitly asked for
restraint ("5 exceptional interactions, not 30 mediocre ones"), so this
picked the three most catalogue-feeling spots (materials marquee, Work
grid, Process section) and gave each exactly one real interaction,
rather than attempting the brief's full menu of ~12 ideas at once.

- **Materials marquee → `MaterialExplorer`.** `materials` changed from
  `string[]` to `MaterialSample[]` (name/description/accent) — a real,
  if small, content-model change. Hovering or tapping a chip locally
  re-tints `--color-accent` **on the section's own wrapper element**,
  not on `:root` — deliberately avoids fighting `ThemeEngine`, which
  owns `:root`'s value via the scroll-driven blend. Clearing the
  preview just removes the local override, letting the live
  scroll-theme value cascade back through automatically — no snap-back
  glitch, no coordination needed between the two systems. Marquee scroll
  pauses on `:hover`/`:focus-within` (`app/globals.css`) since a row
  that keeps sliding under the cursor defeats the interaction entirely.
  The duplicated second copy of each chip (needed for the seamless
  scroll loop) is `aria-hidden`/`tabIndex={-1}` — only the first copy is
  reachable by keyboard or a screen reader.
- **Work grid → one signature "Look Again" card + a lighter cue on the
  rest.** `LookAgainReveal.tsx` targets whichever project has
  `featured: true` first in array order — click opens a dialog, a
  "Reveal details" button stages in general craftsmanship callouts
  (`craftDetails` in `content/site.ts`: balanced negative space,
  consistent letterforms, etc.) ending on "Great design lives in the
  details." These are deliberately generic principles, not specific
  claims about this particular placeholder project — §11.2's "never
  invent a claim to fill a layout" applies here too, even for a UI
  flourish. Every other card gets a lighter "What changed?" hover label
  — enough variety to feel like an exhibition, not so much that the
  interaction language becomes incoherent.
  - **Caught in self-review before calling it done:** the signature
    card's first draft put `group` and `hover-zoom` on the *same*
    element. The existing CSS rule (`,group:hover .hover-zoom`, dating
    to M1) requires `hover-zoom` to be a *descendant* of `.group` — an
    element can't be its own descendant, so the scale-up-on-hover effect
    silently never fired on exactly the one card meant to feel the most
    polished. Fixed by matching `WorkGrid.tsx`'s existing nesting
    depth exactly.
  - **Known simplification, not fixed:** the dialog sets initial focus
    and closes on Escape/backdrop-click, but doesn't implement a full
    Tab-cycle focus trap. Acceptable for a small experimental feature
    with only 1-2 focusable elements inside; flagging rather than
    silently shipping a partial a11y pattern as if it were complete.
- **Process → a clickable/swipeable stepper**, not four static cards.
  Each of the four stages shows an abstract SVG icon
  (`stroke="currentColor"`, so it re-themes for free with the section's
  live accent) instead of a real project photo — none of these stages
  have real photography, and a staged photo pretending to depict a real
  job would be the same kind of dishonesty §11.2 already rules out for
  the portfolio. Click a step number, use arrow keys, or swipe
  left/right on touch — `onTouchStart`/`onTouchEnd` computed inline
  (40px threshold), no gesture library.
- **Deliberately deferred, not forgotten:** Before/After drag-reveal
  (needs a real matched day/night-style photo pair per project — none
  exist), "Shahid's Eye" layered-composition reveal (needs one real,
  richly detailed finished project photo), a Hero interactive layer
  (already carries the most interactive investment on the site via the
  §5.1 day/night reveal — adding more risked diluting rather than
  improving it), and the "creative playground" config tool (real
  build cost, more a bonus feature than a fix for the three sections
  actually identified as catalogue-like).
- **JS budget moved to 144.8 KB gzipped** (from 142.1) — three real
  interactive components, still comfortably under the 150 KB `SPEC.md`
  figure this branch isn't formally held to.
- **The non-signature cards' "What changed?" hover label is confirmed
  decoration, not a bug.** Raised directly with the client: those cards
  zoom slightly and show the label on hover, but clicking does nothing —
  a real gap between what the label promises and what happens. Offered
  either wiring it to a lighter version of the same reveal dialog, or
  leaving it as ambient hover decoration with the interaction budget
  staying spent on the one signature card. Client chose the latter, for
  now — logged so a future session doesn't "fix" this as an oversight.

  > **Superseded below** — a follow-up UX audit (next entry) concluded
  > the label needed a real answer, not just an honest "decoration"
  > label, and implemented one at a deliberately lighter weight than the
  > signature card.

## UX audit — fixing broken promises before adding anything else

Client asked for a genuine audit ("open and interact with the website
as a first-time visitor"), not another feature. **Caveat that matters:
the Chrome extension still isn't connected in this environment, so this
audit is a rigorous trace of actual runtime behaviour — every event
handler, CSS state and timing, read in full — not a confirmed live
interaction.** Flagged explicitly rather than silently presenting
code-reading as equivalent to using the site.

**Kept as-is:** the signature card's mechanism, Process's four distinct
icons, Materials' local CSS-variable scoping (already correctly
isolated from `ThemeEngine`), reduced-motion handling across all three
components (verified correct by trace). No case of excess animation
worth removing — the existing set is already restrained.

**Fixed — real bugs, not taste calls:**

- **"What changed?" did nothing on click.** This directly contradicted
  the label's own promise. Resolved as **Option B** from the three the
  client offered: the pill itself is now the trigger, and clicking it
  swaps its own text in place to a genuine, category-honest one-liner
  (`whatChangedByMaterial` in `content/site.ts`, keyed by
  `MaterialCategory` — "Backlit evenly, corner to corner — no hot
  spots," not a fabricated claim about the specific placeholder
  project). No modal, no staged reveal — mechanically distinct from the
  signature card, which is what actually preserves the hierarchy the
  client asked to protect, rather than differing only in content length.
- **Both pills were `:hover`-only — invisible and unreachable on
  touch**, not just "less convenient" there. Both now render at
  `opacity-70` at rest, brightening on hover/focus, so touch users can
  see there's something to tap at all. This is a bigger conceptual
  fix than a style tweak: an interaction gated entirely behind `:hover`
  isn't a mobile inconvenience, it's a feature that doesn't exist on
  mobile.
- **`MaterialExplorer` had no way to dismiss a tapped preview on
  touch** — no `mouseleave` equivalent exists there. This is the same
  click-vs-hover conflict this component hit once already (see the
  "sample content pass" entries above); fixed properly this time by
  branching on `window.matchMedia('(hover: none)')`
  (`useSyncExternalStore`, same pattern as `detectTier`, since
  `react-hooks/set-state-in-effect` rejects a plain `useEffect` +
  `setState` for a one-time client-only read) rather than overloading
  one click handler for both input types: hover-capable devices preview
  on enter/leave as before, touch devices toggle on tap.
- **The preview panel appeared and disappeared with a hard cut** (a
  conditional-render mount/unmount, no transition) — closer to a
  tooltip than an "exploration." Added a fade+lift on entry
  (`material-preview-in`, gated inside the existing
  `prefers-reduced-motion: no-preference` block, matching every other
  animation in this file rather than an ungated inline Tailwind
  arbitrary class, which was the first draft's mistake).
- **The dialog had no real focus trap** despite `role="dialog"`
  implying one. `LookAgainReveal.tsx` now recomputes the focusable set
  on every Tab press (content changes when `revealed` flips — the
  "Reveal details" button disappears — so the set can't be cached once
  at open) and wraps Tab/Shift+Tab at the panel's edges.
- **Process's `role="tablist"`/`role="tab"` promised a keyboard contract
  it didn't keep** — that ARIA pattern implies arrow keys move focus
  between tabs; this component only changes the active step, focus
  stays put. Replaced with a plain `role="group"` +
  `aria-current="step"`, which describes the actual behaviour honestly
  instead of half-implementing a heavier widget pattern.

**Improved:**

- Materials: hovering now washes the whole strip with a low-opacity
  `color-mix()` tint of the local accent (`.material-explorer`'s
  background-color, also newly transition-gated), not just a small
  swatch dot — closer to "touching the material" than "reading a
  tooltip."
- Materials: chips now carry a dashed underline at rest — a static
  affordance so a first-time visitor has some visual reason to try
  hovering one, instead of discovering the interaction by accident.
- Materials: the swatch is a diagonal-stripe pattern (the same visual
  language as `Placeholder.tsx`), not a flat colour circle — reads as
  "material sample" rather than "a colour."
- Process: added a connecting track behind the four step-number
  circles, filled up to the active step — shifts the read from
  independent tabs toward a journey with a visible position in it.

**Caught in the process of fixing the swatch:** the first draft used a
Tailwind arbitrary `bg-[repeating-linear-gradient(...)]` class — exactly
the kind of multi-comma value Tailwind's bracket syntax can mis-parse.
Matched `Placeholder.tsx`'s already-established inline-style approach
for the same gradient instead of trusting the arbitrary class blind.

- **JS budget moved to 145.4 KB gzipped** (from 144.8) — all of the
  above, still comfortably under the 150 KB figure this branch isn't
  formally held to.

## Portfolio 2.0 — "Why This Works"

Second major idea after the theme system, deliberately built as one
thing at a time per the client's own iteration pacing. Evolves the
signature Work card from "here's what we made" toward "here's why it
works," via four short conceptual layers (Problem, Choice, Detail,
Result) revealed one at a time — not a staged dump of facts, which is
what the previous `craftDetails` version actually was, in retrospect.

- **Architecture: extended the existing modal, not a route.** Content
  is four short sentences, one image, one marker — nowhere near heavy
  enough to justify `/work/[slug]` routing, a new page-load path, or
  SEO investment in project data that's still bracketed placeholders.
  The modal already had a working focus trap and fits the site's
  single-page scroll model; a route would fight that model for no real
  gain at this content depth. Revisit once real per-project photography
  and facts exist — that's the point at which a dedicated page's SEO
  value would actually mean something.
- **Depth is data-driven, not per-project.** `whyThisWorksByMaterial`
  (`content/site.ts`) is keyed by `MaterialCategory`, not by project —
  every project's client/location/year is still a bracketed placeholder
  (§11.2), so there's no real per-project fact to hang a unique story
  on yet. Only `signage` (the signature card's category) has a
  `problem`/`detail`/`detailMarker`; every other category gets the
  lighter choice+result version through the exact same code path
  (`LookAgainReveal` builds its layer list by filtering out whichever
  optional fields are absent). This means the *non-signature* "Why this
  works" line for `acp-signboard-two-panel` (also `signage`) will show
  the identical "Choice" sentence as the signature card's — expected
  and correct given the data model, not a duplication bug.
- **The stepped reveal reuses Process.tsx's own visual language** —
  numbered circles with a connecting progress line that fills as you
  advance, `role="group"` + `aria-current="step"` rather than a tabs
  ARIA pattern (same fix as the Process audit, applied consistently
  here from the start rather than repeating the earlier mistake).
  Deliberate: reusing an established interaction language site-wide is
  part of what keeps this from reading as a generic template.
- **The image stays completely stable across stages — only a small
  marker (dot + label) appears, and only during "The Detail."** No
  real photography exists yet, so the marker points at a placeholder;
  the mechanism is real and will mean something the moment a real photo
  replaces it, same reasoning as every other placeholder-first build in
  this project.
- **Every non-signature card gets exactly one new line**, not a second
  pill stacked on the image: "Why this works" sits in the text block
  below the existing client/location/year row, revealing the category's
  `choice` sentence on click. Keeps the grid visually calm per the
  client's explicit "do not turn every card into a giant panel"
  instruction, while still giving every project *some* depth, per
  "normal project: short story."
- **Focus trap and reduced-motion handling are unchanged, not
  reimplemented** — the existing Tab-wrapping logic already recomputes
  the focusable set on every keypress (built that way originally
  because `revealed` used to toggle content; now `stage` does the same
  job), so it needed no changes to keep working across the new stepped
  content.
- **`craftDetails` is retired**, not kept alongside the new system —
  it was the exact flat-list-reveal pattern this iteration replaces,
  and leaving it as dead-but-exported content would invite a future
  session to wonder which one is current.
- **JS budget moved to 146.3 KB gzipped** (from 145.4) — one real
  content-driven feature, still comfortably under 150 KB.

## Open items outside the code (§17 of the brief — tracked, not forgotten)

- Google Business Profile: claim it, upload the real photography once shot,
  correct hours/services/service area.
- Review loop: ops app should request a review the evening of delivery,
  pointed at the Business Profile; surface resulting reviews on the site.
- `/[city]/[service]` pages: route structure left open, not built during
  M0–M7.
- Edge caching for `public/media/hero-seq/`: long `Cache-Control: immutable`
  once that directory has real content (M3).
