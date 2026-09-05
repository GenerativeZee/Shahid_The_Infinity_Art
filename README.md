# The Infinity Art

Marketing site for **The Infinity Art** — a signage, printing, wedding-invitation
and brand-identity studio. Built as a single-page interactive exhibition rather
than a conventional agency site: one major creative idea per iteration, the
running log of choices is in [`DECISIONS.md`](./DECISIONS.md).

## Stack

- **Next.js 16** (App Router, Turbopack) · **React 19** · **TypeScript**
- **Tailwind CSS v4** (CSS-first `@theme`, tokens in `app/globals.css`)
- **three.js / R3F** — code-split, lazy, only for the hero + wedding-card 3D
- No CMS, no database. All copy lives in `content/site.ts`.

## Develop

```bash
npm install
npm run dev        # http://localhost:3000
```

```bash
npm run lint
npm run build
npm run check:budget   # fails if "/" first-load JS > ~170 KB gzipped (run after build)
```

## Deploy

Deployed on Vercel from `master` via the GitHub integration
(`GenerativeZee/Shahid_The_Infinity_Art`). Pushing `master` ships production;
other branches get preview URLs. Live: https://shahid-the-infinity-art.vercel.app

## Before this is truly production-ready

The site runs on flagged placeholder data. These are hard gates, tracked in
`DECISIONS.md`:

- **Business details** (`content/site.ts` `business`) — phone, WhatsApp, address,
  geo, hours. Feed the WhatsApp button and the LocalBusiness JSON-LD.
- **Projects** (`content/site.ts` `projects`) — client names, locations, years.
- **Service pricing** (`content/site.ts` `services`) and **trust numbers**
  (`trust`).
- **Photography** — `public/media/` per the shoot brief in
  `public/media/README.md`; the `hero-day.jpg` / `hero-night.jpg` pair; a real
  Open Graph image (currently the logo is a stopgap).
- **`SITE_URL`** in `app/layout.tsx`, `app/robots.ts`, `app/sitemap.ts` — swap
  for a real custom domain when one is bought.
- **Quote pipeline** — `app/api/quote/route.ts` logs and forwards to WhatsApp;
  the photo field isn't uploaded. Wire real storage before taking live leads.
