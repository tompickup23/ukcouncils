# UK Councils

## Handoff, 27 September 2026

**Live.** https://ukcouncils.co.uk/ serves `main` (PRs #1 to #7 merged): 323
pages, 296 council pages, full security headers, the analytics beacon reporting
page loads, `www` redirecting to the apex (301, path and query kept), sitemap
of 322 URLs submitted to Search Console (property `sc-domain:ukcouncils.co.uk`
on info@ukplaces.co.uk, "Success", 322 discovered). Phase 0 and Phase 1
acceptance are met.

**How it was deployed.** From this Mac with `wrangler pages deploy dist
--project-name ukcouncils --branch main` after a `BUILD_OG=1` build and every
gate. `deploy.yml` fails at the publish step until the `CLOUDFLARE_API_TOKEN`
repository secret exists; until then deploy the same way by hand.

**DNS (Cloudflare zone `1eca098af86df9cddbfc9ee0938096d8`).** Proxied CNAMEs `@`
and `www` to `ukcouncils.pages.dev`; MX `1 smtp.google.com`; SPF; Google site
verification TXT; DMARC `v=DMARC1; p=none; rua=mailto:info@ukcouncils.co.uk`.
Redirect rule "Redirect from WWW to root".

**Email.** ukcouncils.co.uk is a user alias domain of the ukplaces.co.uk
Workspace, verified, Gmail active. DKIM cannot be generated until 24 to 72 hours
after Gmail was enabled (27 September): then Admin, Apps, Gmail, Authenticate
email, ukcouncils.co.uk, Generate, add the TXT, Start authentication, and move
DMARC to `p=quarantine`.

**Left for Tom.** The repository secret (one command, below); until it exists
`deploy.yml` fails at publish on every push to `main` and deploys are by hand.
Branch protection on `validate` at launch (needs GitHub Pro or a public repo).
Bing Webmaster Tools: done by Tom (imported from Search Console).

```bash
gh secret set CLOUDFLARE_API_TOKEN -R tompickup23/ukcouncils
```

**Next session, in this order.**
1. Phase 2 (plan section 9): a term dates section on every council page from
   `/Users/tompickup/schoolholidaysdates-site/data-source/calendars_merged.json`
   (next break, full year, confidence label as published, "set by X County
   Council" for districts, link and `.ics` on UK School Holiday Dates rebuilt
   from its live sitemap); an elections section from
   `/Users/tompickup/ukelections/data` (seats by party, control, history since
   2016, cycle, next election date only where UKE holds one, by-elections, no
   person named); `/term-dates/2026-27/` and `/elections/` hubs in
   `STATIC_PATHS`; by-elections in the RSS. Read UKE files from `origin/main`.
2. DKIM from 30 September 2026 (Google allows it 24 to 72 hours after Gmail was
   enabled on 27 September): Admin, Apps, Gmail, Authenticate email,
   ukcouncils.co.uk, Generate, TXT into Cloudflare, Start authentication; then
   DMARC to `p=quarantine`.
3. Pagefind site search (`'wasm-unsafe-eval'` is already in the CSP).
4. Phase 4, Wales and Scotland council tax; Northern Ireland pages on rates.
5. Sister site footer links to UK Councils, and UK Places fixes (Shepway name,
   `officialName`, 60 stale AI DOGE coverage claims), each in its own repo.
6. The registry rebuild needs the sister clones on this Mac, so it cannot run
   in `refresh-data.yml`; schedule it here or fetch the mappings over HTTPS.

Deploying by hand from this Mac, after every gate:

```bash
rm -rf .astro node_modules/.vite dist && BUILD_OG=1 npm run build && npm run test:dist && npx --yes wrangler@4 pages deploy dist --project-name ukcouncils --branch main --commit-hash "$(git rev-parse HEAD)"
```

Then `npm run indexnow` when pages were added.

**Open question.** The adult social care "element" in MHCLG Tables 8a and 8b
is not printed: the technical notes do not define it and it is not the whole
precept. It stays in the data until its definition is confirmed.

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
