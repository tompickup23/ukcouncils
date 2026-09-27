# ukcouncils: agent context

The public site for ukcouncils.co.uk. Astro 6, TypeScript, all pre-rendered,
Node 22.12 or later. One page per UK local authority answering, with the source
under every figure: council tax by band and its change, school term dates, the
last election and seats by party, what the council buys.

Read these before substantial work:

1. `/Users/tompickup/clawd/docs/plans/ukcouncils-plan-2026-09-27.md`, the plan
   and the source of truth for scope and phases. Update it at the end of every
   session with what shipped and what changed and why.
2. `/Users/tompickup/clawd/docs/lessons/sister-sites.md`, the Astro, CSP, OG,
   sitemap and house style traps. They all apply here.
3. `/Users/tompickup/aidoge-site/CLAUDE.md`, whose data rules travel with any
   AI DOGE data this site reads.

## The rules that are not negotiable

**Never estimate.** A figure not in a source table does not appear. A missing
band, a missing year, or a zero in a return is an absent figure, and the
section it belongs to is absent: not blank, not zero, not a placeholder. Never
derive one council tax band from another (Scottish band ratios differ from
England's), never apportion a county figure to a district, never carry a value
forward from a previous year.

**Rank only where every body has the same complete official year.** The MHCLG
council tax tables qualify: sort within class, label the class, say nothing
about motive. AI DOGE payments do not qualify, ever.

**Never name an individual.** No councillor, officer, supplier who is a person
or member of the public, on any surface: body text, captions, alt text, OG
cards, JSON-LD, RSS. Supplier strings and any free text go through
`src/lib/redaction.ts` (ported from aidoge-site `src/lib/spending/redaction.ts`)
before they reach a page. Seats by party answers "who are the councillors"
without a name.

**A rule and a date, never a motive.** No "hiding", "failing", "waste". The
test suite greps for them.

**Every figure has its source line directly under it**, with the publisher,
table and date. A caveat sits under the figure it qualifies (the parish precept
line under every Band D figure is not optional).

## House style

- No em dashes, no en dashes, not entity encoded, not in comments, JSON,
  generated strings or `public/`. No `" - "` pseudo dash in prose. Tested.
- Titles use a pipe: `Council tax in Burnley 2026/27 | UK Councils`. Every
  title carries the place, and the year where the data is a year.
- `n/a` is the null cell.
- British English, declarative, no hedging, no party framing on any surface.

## Things that will bite

- **Data reads resolve from `process.cwd()`**, never `import.meta.url`. Vite
  relocates modules under `astro build` and a module relative read fails
  silently.
- **`npm test` does not type check; `npm run check` does.** Run both before
  every commit and grep the `- N errors` line, never `tail` the output.
- **Adding a hub under `src/pages` means adding it to `STATIC_PATHS`** in
  `src/lib/site.ts` in the same change. `tests/site.test.ts` fails otherwise.
- **The CSP allows no inline script.** `script-src 'self' 'wasm-unsafe-eval'`.
  The pre-paint theme script is `public/theme-init.js`, loaded with
  `is:inline src=`, which Astro leaves as an external file. Astro still
  inlines small component scripts; `scripts/inject_csp_hashes.mjs` runs after
  `astro build` and writes their hashes into `dist/_headers`. Never add a hash
  by hand, never add `'unsafe-inline'` to `script-src`.
- **Only `npm run test:csp` applies the headers**, by serving `dist/` through
  `wrangler pages dev`. Run it after any change to a component `<script>`, a
  font import, an island or `public/_headers`.
- **Every client side `fetch` needs a `connect-src` entry, and every entry
  needs a fetch.** The test fails both ways. The postcode door will add
  `https://api.postcodes.io`; the analytics beacon adds
  `https://cloudflareinsights.com` and `https://static.cloudflareinsights.com`.
- **Sister site URLs come from that site's live sitemap**, never a slug
  pattern. UK Elections council pages are `/seats/<slug>/`, not `/councils/`.
- **`SITE_URL` in `src/lib/site.ts` is the only place the host is written in
  `src/`.** Tested. `astro.config.mjs` and `scripts/check-dist.mjs` hold copies
  because they load before `src/`; the test asserts the config copy matches.
- **`BUILD_OG=1` gates the Satori pass**, through an `env:` block in a
  workflow, never inline (the PreToolUse hook rejects the inline form). Satori
  needs static weight TTFs in `data/fonts`. Wipe `.astro/` and
  `node_modules/.vite/` after editing the OG endpoint.
- **No page scrolls horizontally at 375px.** `e2e/layout.spec.ts`, two pixels
  of tolerance, runs on every static path.
- **Components are copied into this repo, never imported across repos.**

## Design

The estate brand system (`clawd/briefings/uk-network-brand/BRAND-SYSTEM-2026-08-23.md`)
governs: Source Serif 4 at 600 for display, Source Sans 3 at 400 and 600 for
UI, via fontsource, one neutral ramp, one dark ground for OG cards. The token
block at the top of `src/styles/global.css` is rendered from
`clawd/briefings/uk-network-design-system/shared/tokens.css.tmpl`; do not hand
edit inside the `estate-tokens` sentinels. This supersedes the plan's section 5
mention of Sora and Manrope, which UK Demographics has since moved off.

Accent triple, hue 319 (plum), chosen clear of every estate hue and computed
against WCAG AA, not eyeballed:

| token | value | measured |
|---|---|---|
| deep | `#7a2d62` | 8.83 on white, 8.16 on subtle, 7.79 on wash |
| bright | `#e28fc8` | 7.99 on the dark ground |
| wash | `#f8eef5` | `--text-faint` 4.93 on it |
| dark wash | `#2a1424` | bright 7.35 on it |

No hex literal outside `global.css` in `src/`. Tested. Light and dark follow
the system; the manual choice is stored under `ukcouncils-theme`.

## Infrastructure

- GitHub `tompickup23/ukcouncils`, private until launch.
- Cloudflare account `35e8f9e8edb5487b97309d107331f7f5`, Pages project
  `ukcouncils`, production branch `main`, direct upload from `deploy.yml`.
- `ci.yml` on pull requests: job `validate` (check and unit tests) is the one
  branch protection gates on; job `build` builds, runs the dist check, the
  375px and desktop layout run and the CSP run.
- `www` to apex: Cloudflare Pages `_redirects` cannot redirect between hosts,
  so the 301 is a redirect rule on the zone, not a line in `public/_redirects`.
- One.com and Google Admin steps are Tom's to approve one save at a time.
  Never type a password or handle a 2FA prompt.
