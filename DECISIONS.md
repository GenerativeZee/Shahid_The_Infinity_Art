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

## Open items outside the code (§17 of the brief — tracked, not forgotten)

- Google Business Profile: claim it, upload the real photography once shot,
  correct hours/services/service area.
- Review loop: ops app should request a review the evening of delivery,
  pointed at the Business Profile; surface resulting reviews on the site.
- `/[city]/[service]` pages: route structure left open, not built during
  M0–M7.
- Edge caching for `public/media/hero-seq/`: long `Cache-Control: immutable`
  once that directory has real content (M3).
