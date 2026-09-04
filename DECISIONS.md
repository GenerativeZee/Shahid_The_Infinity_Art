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

## Open items outside the code (§17 of the brief — tracked, not forgotten)

- Google Business Profile: claim it, upload the real photography once shot,
  correct hours/services/service area.
- Review loop: ops app should request a review the evening of delivery,
  pointed at the Business Profile; surface resulting reviews on the site.
- `/[city]/[service]` pages: route structure left open, not built during
  M0–M7.
- Edge caching for `public/media/hero-seq/`: long `Cache-Control: immutable`
  once that directory has real content (M3).
