# UK Councils

## Handoff, 27 September 2026 (Phase 0)

Shipped: the repository scaffold. A one page holding site with the estate
tokens and a plum accent, `public/_headers` with the full header set, the CSP
hash injector, the unit suite (sitemap parity, host name, pipe titles, headers,
`connect-src` parity, dashes, pseudo dashes, colour tokens, motive words), the
dist check, the 375px and desktop Playwright run, the CSP run through
`wrangler pages dev`, and `ci.yml` and `deploy.yml`.

Not yet done in Phase 0: the one.com nameserver change, custom domains, the
`www` redirect rule, the Web Analytics beacon, the `CLOUDFLARE_API_TOKEN`
repository secret, branch protection on `validate`, and Google Workspace for
`info@`. The plan file records which of these are waiting on Tom.

Next: Phase 1, England council tax (`scripts/fetch-council-tax.mjs` against
MHCLG Tables 9 and 8a), with `src/lib/redaction.ts` ported before any supplier
or free text string is read.

## What it is

One page per UK local authority answering, with the source under every figure:
council tax by band and how much it changed, when the schools break up, who won
the last election, what the council buys. The plan is
`/Users/tompickup/clawd/docs/plans/ukcouncils-plan-2026-09-27.md`; the rules an
agent must follow are in `CLAUDE.md`.

## Running it

Node 22.12 or later (`.nvmrc`).

```bash
npm ci
npm run dev          # http://localhost:4321, no security headers applied
npm test             # unit suite, no type check
npm run check        # type check; grep the "- N errors" line
npm run build        # astro build, then CSP hashes into dist/_headers
npm run test:dist    # the built tree: titles, dashes, sitemap, canonicals, hashes
npm run test:e2e     # 375px and desktop, against astro preview
npm run test:csp     # the production headers, through wrangler pages dev
```

Before every commit: `npm test` and `npm run check`. After any change to a
component `<script>`, a font, an island or `public/_headers`: `npm run build &&
npm run test:csp`.

## Deploying

A push to `main` runs `.github/workflows/deploy.yml`: the same gates as CI, a
build with `BUILD_OG=1`, then `wrangler pages deploy dist --project-name
ukcouncils --branch main`. It needs the `CLOUDFLARE_API_TOKEN` repository
secret. Pull requests run `.github/workflows/ci.yml` and publish nothing.

## Data

Every dataset is written by a script under `scripts/` into committed JSON under
`data/`, with a `generated` stamp and a `source` block. The site reads only that
JSON, from `process.cwd()`. Sources, licences and caveats are listed in the plan,
section 3.
