# UK Councils

## Handoff, 27 September 2026

**Council-page release.** This change consolidates batches A to E and the
verified school-holiday adapter: council lookup, band answers, comparisons,
search, maps, sharing, exports and the blue palette. The implementation records
under `docs/` describe the earlier local sessions; their statements about
uncommitted work are historical. The launch record below is also historical.
The contact mailbox remains unverified and unpublished. Spending integration
is separate work in PR #10, which must rebase after this release.

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

Follow [the improvement and reuse plan](docs/IMPROVEMENT-PLAN-2026-09-27.md),
which supersedes the earlier post-launch ordering. This handoff is a plan,
not permission to commit, push, deploy or change another site's public output.

1. Confirm the contact mailbox receives mail before setting `CONTACT_EMAIL`.
   Review the dependency-audit follow-up in the implementation record before
   a later framework migration.
2. Rebase the separate spending integration in PR #10 after this release.
3. Batch F: school dates now use a verified committed feed; election results
   still need a separate, reproducible data adapter. Preserve education-authority attribution, published confidence,
   source dates and the prohibition on individual names. Read UKE inputs from
   an identified revision of `origin/main`; obtain sister URLs from live
   sitemaps. The original plan retains the source inventory.
4. Batch G: Wales and Scotland council tax, and Northern Ireland rates, after
   their separate definitions and coverage checks pass. News is an optional
   editorial programme, not a dependency of the council service.

Infrastructure can proceed independently when authorised:

1. DKIM from 30 September 2026 (Google allows it 24 to 72 hours after Gmail was
   enabled on 27 September): Admin, Apps, Gmail, Authenticate email,
   ukcouncils.co.uk, Generate, TXT into Cloudflare, Start authentication; then
   DMARC to `p=quarantine`.
2. Make registry and dataset refreshes reproducible without local sister
   clones, and validate generated changes within the refresh workflow.
3. Sister site links and UK Places fixes remain separate work in their own
   repos. UK Food Hygiene stays private and unlinked under the global guide;
   remove existing public links in the first authorised implementation batch.

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

## Phase two local improvements

[Implementation and validation record](docs/PHASE-TWO-IMPLEMENTATION-2026-09-27.md):
blue palette, lazy full-site search, state-preserving sharing, sourced maps,
CSV downloads and print layouts. `npm run build` now generates Pagefind after
Astro. Boundary snapshots refresh explicitly with `node scripts/fetch-boundaries.mjs`.
See `scripts/brand-colours.json` and `python3 scripts/apply-brand.py` for the
site's blue accent configuration and shared-template regeneration.
