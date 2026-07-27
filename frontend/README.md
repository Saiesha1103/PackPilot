# PackPilot — Hero Landing Page

Next.js 15 + TypeScript + Tailwind + Framer Motion + Lucide.

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:3000. (`npm run build` needs internet access once, to fetch
IBM Plex Sans / IBM Plex Mono / Inter from Google Fonts via `next/font`.)

## What's here

- `app/layout.tsx` — font loading (Inter for body, IBM Plex Sans for display,
  IBM Plex Mono for data/labels), global metadata.
- `app/page.tsx` — assembles `<Navbar />` + `<Hero />`.
- `components/navbar.tsx` — fixed nav, blurs and gains a hairline border past
  16px of scroll.
- `components/hero.tsx` — the split-layout hero. Left: badge → word-by-word
  headline reveal → description → CTAs → tech badge row, all staggered on
  mount. Right: your uploaded factory image with a subtle scroll parallax.
- `components/hero-kpi-stack.tsx` — the six KPI panels (OEE, Production,
  Temperature, Humidity, Machine Health, Line Status), data-driven from one
  array, staggered in from the right, with a gentle continuous float.
- `components/count-up.tsx` — tweens numbers up from 0 on scroll-into-view;
  falls back to the final value instantly if the user has reduced motion on.
- `components/ui/button.tsx`, `components/ui/badge.tsx` — small shadcn-style
  primitives (cva variants) rather than pulling the full shadcn CLI, to keep
  the dependency tree lean.

## One deliberate change from the brief

Your reference photo already has KPI cards **rendered into the pixels** on
its right edge. Overlaying new live cards in the same spot would have shown
two sets of numbers stacked on top of each other. Instead, `hero.tsx` keeps
the image completely untouched and fades its right ~46% into the page's navy
background with a CSS gradient (`bg-gradient-to-r ... to-base-950`) — that
visually retires the old baked-in readouts — then places the real, animated
KPI stack over that faded zone. The photo itself is never redrawn or
regenerated.

## Design decisions (why it doesn't look templated)

- **Type:** IBM Plex Sans for the headline/KPI numbers, IBM Plex Mono for
  every label, badge, and status string. The mono face is doing real work
  here — it's the same typographic move real HMI/SCADA screens and
  engineering spec sheets use, which is where this brief's authenticity
  needs to come from, not a generic "startup sans + serif" pairing.
- **Cards:** `hmi-panel` in `globals.css` is a deliberate instrument-panel
  shape — a thin cyan rail down the left edge, not a generic centered-glow
  glass card — closer to a Siemens/Honeywell control-room readout than a
  SaaS pricing card.
- **Background:** a masked engineering blueprint grid sits behind the left
  content only (`.blueprint-grid`), faded via `mask-image` so it reads as
  texture, not decoration.
- **Color:** `#3FC6E0` cyan, intentionally desaturated rather than neon, on
  `#05070B`/`#0A0E14` navy — matches the source photo's palette instead of
  fighting it.
- **Motion:** one orchestrated sequence on load (badge → headline words →
  copy → CTAs → tech badges → KPI cards), plus a slow, small parallax and
  float — no scattered hover gimmicks. `prefers-reduced-motion` is respected
  throughout.

## Extending this

The rest of the page (`#platform`, `#architecture`, `#reliability`,
`#resources` anchors in the navbar) isn't built yet — this delivery is the
hero, to the level of polish you asked for. Happy to keep building the
sections below in the same system if useful.
